'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  File,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  FacebookLeadData,
  mapFacebookLeadToLead,
  GenericExcelLeadData,
  mapGenericExcelToLead,
  isGenericExcelFormat,
} from '@/features/leads/types/leadFacebook';

interface ImportResult {
  inserted: number;
  duplicates: number;
  errors: any[];
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<ImportResult>;
  title?: string;
  description?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface ParsedData {
  headers: string[];
  rows: any[][];
  rawData: any[];
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  title = 'Importar Datos',
  description = 'Selecciona o arrastra un archivo CSV o Excel para importar tus datos.',
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const rowsPerPage = 10;

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      let data: any[] = [];

      if (extension === 'csv') {
        data = await parseCSV(file);
      } else if (extension === 'xls' || extension === 'xlsx') {
        data = await parseExcel(file);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

      if (data.length === 0) {
        throw new Error('El archivo está vacío');
      }

      // Convertir a formato de tabla
      const headers = Object.keys(data[0]);
      const rows = data.map((row) => headers.map((header) => row[header] || ''));

      setParsedData({
        headers,
        rows,
        rawData: data,
      });

      toast.success(`Archivo procesado: ${data.length} filas encontradas`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el archivo');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`Error en CSV: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(new Error(`Error al parsear CSV: ${error.message}`));
        },
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Convertir a formato de objetos
          if (jsonData.length < 2) {
            reject(
              new Error(
                'El archivo Excel debe tener al menos una fila de encabezados y una fila de datos'
              )
            );
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          const objects = rows.map((row) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve(objects);
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setParsedData(null);
      setCurrentPage(1);
      setUploadStatus('idle');
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleImport = async () => {
    if (!parsedData) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    setImportResult(null);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Detectar el tipo de archivo basado en las columnas
      const isFacebookLeads = parsedData.headers.some(
        (header) => header.includes('¿') || header === 'lead_status' || header === 'platform'
      );
      const isGenericExcel = isGenericExcelFormat(parsedData.headers);

      let dataToImport;
      let skippedRows = 0;

      if (isFacebookLeads) {
        // Formato Facebook Leads
        dataToImport = parsedData.rawData
          .map((row: any) => {
            try {
              return mapFacebookLeadToLead(row as FacebookLeadData);
            } catch (error) {
              console.error('Error mapping Facebook lead:', error, row);
              return null;
            }
          })
          .filter(Boolean);
      } else if (isGenericExcel) {
        // Formato Excel genérico (columnas en español)
        const mappedData = parsedData.rawData.map((row: any) => {
          try {
            return mapGenericExcelToLead(row as GenericExcelLeadData);
          } catch (error) {
            console.error('Error mapping generic Excel lead:', error, row);
            return null;
          }
        });
        
        // Contar filas omitidas (sin nombre)
        skippedRows = mappedData.filter((item: any) => item === null).length;
        dataToImport = mappedData.filter(Boolean);
        
        if (skippedRows > 0) {
          toast.warning(`${skippedRows} filas omitidas por no tener nombre completo`);
        }
      } else {
        // Formato desconocido - mostrar error con las columnas detectadas
        clearInterval(progressInterval);
        toast.error(
          `Formato de archivo no reconocido. Columnas detectadas: ${parsedData.headers.slice(0, 5).join(', ')}...`
        );
        setIsUploading(false);
        return;
      }

      if (dataToImport.length === 0) {
        clearInterval(progressInterval);
        toast.error('No hay datos válidos para importar');
        setIsUploading(false);
        return;
      }

      const result = await onImport(dataToImport);
      setImportResult(result);

      setUploadProgress(100);

      if (result.errors.length > 0) {
        setUploadStatus('error');
        toast.error(
          `Importación completada con errores: ${result.inserted} insertados, ${result.duplicates} duplicados, ${result.errors.length} errores`
        );
      } else {
        setUploadStatus('success');
        toast.success(
          `Importación exitosa: ${result.inserted} leads importados${result.duplicates > 0 ? `, ${result.duplicates} duplicados omitidos` : ''}`
        );

        setTimeout(() => {
          handleClose();
        }, 2000);
      }

      clearInterval(progressInterval);
    } catch (error) {
      setUploadStatus('error');
      setImportResult({
        inserted: 0,
        duplicates: 0,
        errors: [{ message: error instanceof Error ? error.message : 'Error desconocido' }],
      });
      toast.error('Error al importar los datos');
      console.error('Import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setCurrentPage(1);
    setImportResult(null);
    onClose();
  };

  const removeFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setParsedData(null);
    setCurrentPage(1);
    setUploadStatus('idle');
    setImportResult(null);
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension === 'csv' ? (
      <FileText className="h-6 w-6 text-blue-500" />
    ) : (
      <FileSpreadsheet className="h-6 w-6 text-green-500" />
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Paginación
  const totalPages = parsedData ? Math.ceil(parsedData.rows.length / rowsPerPage) : 0;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = parsedData ? parsedData.rows.slice(startIndex, endIndex) : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    o <span className="text-primary font-medium">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos soportados: CSV, XLS, XLSX (máx. 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                      {parsedData && ` • ${parsedData.rawData.length} filas`}
                    </p>
                  </div>
                </div>
                {!isUploading && !isProcessing && (
                  <Button variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Procesando archivo...</span>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedData && !isProcessing && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="text-sm text-muted-foreground mb-2">
                    Vista previa de los datos ({parsedData.rawData.length} filas totales):
                  </div>
                  <div className="flex-1 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          {parsedData.headers.map((header, index) => (
                            <TableHead key={index} className="font-semibold">
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex} className="text-sm">
                                {String(cell || '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, parsedData.rows.length)} de{' '}
                        {parsedData.rows.length} filas
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando datos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Resultados de la importación:</div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.inserted}
                      </div>
                      <div className="text-xs text-green-600">Insertados</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {importResult.duplicates}
                      </div>
                      <div className="text-xs text-yellow-600">Duplicados</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importResult.errors.length}
                      </div>
                      <div className="text-xs text-red-600">Errores</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-red-600">Errores encontrados:</div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <div
                            key={index}
                            className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-500"
                          >
                            <div className="font-medium">Error {index + 1}:</div>
                            <div className="text-red-700">
                              {error.chunk && `Chunk ${error.chunk}, `}
                              {error.rowIndex !== undefined && `Fila ${error.rowIndex + 1}: `}
                              {error.message || error.error?.message || JSON.stringify(error)}
                            </div>
                          </div>
                        ))}
                        {importResult.errors.length > 10 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            ... y {importResult.errors.length - 10} errores más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading || isProcessing}>
            {uploadStatus === 'success' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {uploadStatus !== 'success' && (
            <Button onClick={handleImport} disabled={!parsedData || isUploading || isProcessing}>
              {isUploading
                ? 'Importando...'
                : `Importar ${parsedData ? parsedData.rawData.length : 0} filas`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
