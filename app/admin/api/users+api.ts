import { db } from '~/db';
import { profiles } from '~/db/schema';
import { eq } from 'drizzle-orm';

// GET /admin/users — list all users
export const GET = async (request: Request): Promise<Response> => {
  try {
    const allUsers = await db
      .select()
      .from(profiles)
      .orderBy(profiles.createdAt);

    return Response.json(allUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: error?.message || 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
};

// PATCH /admin/users — update user role
export const PATCH = async (request: Request): Promise<Response> => {
  try {
    const { userId, role } = (await request.json()) as {
      userId: string;
      role: 'user' | 'admin' | 'super_admin';
    };

    if (!userId || !['user', 'admin', 'super_admin'].includes(role)) {
      return Response.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const [updated] = await db
      .update(profiles)
      .set({ role, updatedAt: new Date() })
      .where(eq(profiles.id, userId))
      .returning();

    if (!updated) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return Response.json(
      { error: error?.message || 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
};
