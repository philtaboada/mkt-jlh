/**
 * Servicio para obtener perfil de usuario de Facebook/Messenger
 */

interface FacebookUserProfile {
  id: string; // PSID
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  name?: string; // Sometimes available
}

export async function getFacebookUserProfile(
  psid: string,
  accessToken: string
): Promise<FacebookUserProfile | null> {
  if (!psid || !accessToken) return null;

  try {
    const fields = 'first_name,last_name,profile_pic,name';
    const url = `https://graph.facebook.com/v18.0/${psid}?fields=${fields}&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.warn('Error fetching Facebook user profile:', data.error);
      return null;
    }

    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      profile_pic: data.profile_pic,
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    };
  } catch (error) {
    console.error('getFacebookUserProfile error:', error);
    return null;
  }
}
