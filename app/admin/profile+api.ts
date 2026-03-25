import { db } from '~/db';
import { profiles } from '~/db/schema';
import { eq } from 'drizzle-orm';

// GET /admin/profile?userId=xxx — get a user's profile (to check admin role)
export const GET = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });

    if (!profile) {
      return Response.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return Response.json(
      { error: error?.message || 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
};
