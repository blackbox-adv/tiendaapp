#!/usr/bin/env python3
"""
TiendApp Production Readiness Fix Script
Fixes all TypeScript build errors and production issues.
"""

import os
import re

BASE = '/home/z/my-project'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✓ Written: {path}")

# ==========================================
# 1. UPDATE PRISMA SCHEMA - Add missing models and fields
# ==========================================
print("\n[1] Updating Prisma schema...")

schema_path = f'{BASE}/prisma/schema.prisma'
schema = read_file(schema_path)

# Add isDemo to Store
schema = schema.replace(
    '  isActive       Boolean  @default(true)\n  visitCount     Int      @default(0)',
    '  isDemo         Boolean  @default(false)\n  isActive       Boolean  @default(true)\n  visitCount     Int      @default(0)'
)

# Add onboardingDone to User
schema = schema.replace(
    '  isActive          Boolean  @default(true)\n  lastLogin         DateTime?',
    '  onboardingDone    Boolean  @default(false)\n  isActive          Boolean  @default(true)\n  lastLogin         DateTime?'
)

# Add Category model
category_model = '''
model Category {
  id        String   @id @default(cuid())
  name      String
  icon      String?
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storeId])
  @@index([storeId, name])
}
'''

# Insert Category model before AuditLog
schema = schema.replace(
    '\nmodel AuditLog {',
    category_model + '\nmodel AuditLog {'
)

# Add categories relation to Store
schema = schema.replace(
    '  products      StoreProduct[]\n  subscriptions Subscription[]\n  payments     Payment[]',
    '  products      StoreProduct[]\n  categories    Category[]\n  subscriptions Subscription[]\n  payments     Payment[]'
)

write_file(schema_path, schema)

# ==========================================
# 2. FIX next.config.ts - Remove ignoreBuildErrors
# ==========================================
print("\n[2] Fixing next.config.ts...")

next_config = read_file(f'{BASE}/next.config.ts')
next_config = next_config.replace(
    '  typescript: {\n    ignoreBuildErrors: true,\n  },',
    '  typescript: {\n    ignoreBuildErrors: false,\n  },'
)
write_file(f'{BASE}/next.config.ts', next_config)

# ==========================================
# 3. FIX categories/route.ts - Use Category model
# ==========================================
print("\n[3] Fixing categories API routes...")

# /api/categories/route.ts
categories_route = '''import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request);
    }

    const categories = await db.category.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(categories, 200, request);
  } catch (error) {
    console.error('Get categories error:', error);
    return apiError('Error al obtener categorias', 500, undefined, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const body = await request.json();
    const { name, icon, storeId } = body;

    if (!name || !storeId) {
      return apiError('Nombre y tienda son requeridos', 400, undefined, request);
    }

    const category = await db.category.create({
      data: {
        name,
        icon: icon || null,
        storeId,
      },
    });

    return apiSuccess(category, 201, request);
  } catch (error) {
    console.error('Create category error:', error);
    return apiError('Error al crear categoria', 500, undefined, request);
  }
}
'''
write_file(f'{BASE}/src/app/api/categories/route.ts', categories_route)

# /api/categories/[id]/route.ts
categories_id_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db.category.findUnique({ where: { id } });

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'icon'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;

    await db.category.delete({ where: { id } });

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}
'''
write_file(f'{BASE}/src/app/api/categories/[id]/route.ts', categories_id_route)

# ==========================================
# 4. FIX products routes - Use storeProduct instead of product
# ==========================================
print("\n[4] Fixing products API routes...")

# /api/products/route.ts
products_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess, serializeDecimals } from '@/lib/api-response';
import { validateBody, createProductSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return apiError('storeId es requerido', 400, undefined, request);
    }

    const products = await db.storeProduct.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(serializeDecimals(products), 200, request);
  } catch (error) {
    console.error('Get products error:', error);
    return apiError('Error al obtener productos', 500, undefined, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const body = await request.json();
    const validation = validateBody(createProductSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request);
    }

    const { name, description, price, imageUrl, category, storeId, originalPrice, color, isActive, featured } = validation.data;

    // Check store ownership
    const store = await db.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
    if (!store) {
      return apiError('Tienda no encontrada', 404, undefined, request);
    }
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return apiError('No tienes permisos para esta tienda', 403, undefined, request);
    }

    // Check product limit based on plan
    const productCount = await db.storeProduct.count({ where: { storeId } });
    const subscription = await db.subscription.findFirst({
      where: { userId: auth.user.userId, storeId, status: 'active' },
      include: { plan: true },
    });
    const maxProducts = subscription?.plan?.maxProducts || 10;
    if (productCount >= maxProducts) {
      return apiError(`Limite de productos alcanzado (${maxProducts}). Actualiza tu plan.`, 403, undefined, request);
    }

    const product = await db.storeProduct.create({
      data: {
        name,
        description: description || '',
        price,
        originalPrice: originalPrice || null,
        imageUrl: imageUrl || '',
        category: category || '',
        color: color || null,
        isActive: isActive ?? true,
        featured: featured ?? false,
        storeId,
      },
    });

    return apiSuccess(serializeDecimals(product), 201, request);
  } catch (error) {
    console.error('Create product error:', error);
    return apiError('Error al crear producto', 500, undefined, request);
  }
}
'''
write_file(f'{BASE}/src/app/api/products/route.ts', products_route)

# /api/products/[id]/route.ts
products_id_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess, serializeDecimals } from '@/lib/api-response';
import { validateBody, updateProductSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.storeProduct.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeDecimals(product));
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = validateBody(updateProductSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400, undefined, request);
    }

    // Verify product ownership
    const product = await db.storeProduct.findUnique({ where: { id }, select: { storeId: true } });
    if (!product) {
      return apiError('Producto no encontrado', 404, undefined, request);
    }
    const store = await db.store.findUnique({ where: { id: product.storeId }, select: { ownerId: true } });
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos para editar este producto', 403, undefined, request);
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'price', 'originalPrice', 'imageUrl', 'category', 'color', 'isActive', 'featured'];
    const data = validation.data;

    for (const field of allowedFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
      }
    }

    const updatedProduct = await db.storeProduct.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(serializeDecimals(updatedProduct), 200, request);
  } catch (error) {
    console.error('Update product error:', error);
    return apiError('Error al actualizar producto', 500, undefined, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { id } = await params;

    // Verify ownership before delete
    const product = await db.storeProduct.findUnique({ where: { id }, select: { storeId: true } });
    if (!product) {
      return apiError('Producto no encontrado', 404, undefined, request);
    }
    const store = await db.store.findUnique({ where: { id: product.storeId }, select: { ownerId: true } });
    if (!store || (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin')) {
      return apiError('No tienes permisos', 403, undefined, request);
    }

    await db.storeProduct.delete({ where: { id } });

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
'''
write_file(f'{BASE}/src/app/api/products/[id]/route.ts', products_id_route)

# ==========================================
# 5. FIX demo route - isDemo now exists in schema
# ==========================================
print("\n[5] Fixing demo route...")

demo_route = '''import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimals } from '@/lib/utils';

export async function GET() {
  try {
    const stores = await db.store.findMany({
      where: { isDemo: true },
      include: {
        products: true,
        categories: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(serializeDecimals(stores));
  } catch (error) {
    console.error('Error fetching demo stores:', error);
    return NextResponse.json({ error: 'Failed to fetch demo stores' }, { status: 500 });
  }
}
'''
write_file(f'{BASE}/src/app/api/demo/route.ts', demo_route)

# ==========================================
# 6. FIX stores/[slug]/route.ts - Use proper relations
# ==========================================
print("\n[6] Fixing stores/[slug] route...")

stores_slug_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess, serializeDecimals } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await db.store.findUnique({
      where: { slug },
      include: {
        products: true,
        categories: true,
        _count: {
          select: { products: true, categories: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Increment visit count (fire-and-forget)
    db.store.update({ where: { slug }, data: { visitCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json(serializeDecimals(store));
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const { slug } = await params;
    const body = await request.json();

    const store = await db.store.findUnique({
      where: { slug },
    });

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    // Check ownership: store.ownerId must match auth.user.userId (or super_admin)
    if (store.ownerId !== auth.user.userId && auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'No tienes permisos para editar esta tienda' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'template', 'primaryColor', 'secondaryColor', 'category', 'logo', 'bannerUrl', 'whatsappNumber', 'hasShipping', 'hasSecurePayment', 'hasReturns', 'popupEnabled', 'popupType', 'popupProductId', 'popupCustomImage', 'popupTitle', 'popupButtonText', 'yapeQrUrl', 'plinQrUrl', 'yapeNumber', 'plinNumber'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedStore = await db.store.update({
      where: { slug },
      data: updateData,
    });

    return apiSuccess(serializeDecimals(updatedStore), 200, request);
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json({ error: 'Error al actualizar la tienda' }, { status: 500 });
  }
}
'''
write_file(f'{BASE}/src/app/api/stores/[slug]/route.ts', stores_slug_route)

# ==========================================
# 7. FIX auth/register - Remove invalid fields
# ==========================================
print("\n[7] Fixing auth register route...")

register_route = '''import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Find free plan for initial subscription
    const freePlan = await db.plan.findFirst({ where: { type: 'free' } });

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        onboardingDone: false,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email).catch((err) => {
      console.error('[REGISTER] Welcome email failed (non-blocking):', err);
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingDone: user.onboardingDone,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}
'''
write_file(f'{BASE}/src/app/api/auth/register/route.ts', register_route)

# ==========================================
# 8. FIX user/route.ts - Use proper Prisma fields
# ==========================================
print("\n[8] Fixing user route...")

user_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            template: true,
            logo: true,
            whatsappNumber: true,
            category: true,
            primaryColor: true,
            secondaryColor: true,
            hasShipping: true,
            hasSecurePayment: true,
            hasReturns: true,
            popupEnabled: true,
            popupType: true,
            popupButtonText: true,
            isDemo: true,
            isActive: true,
            _count: {
              select: {
                products: true,
                categories: true,
              },
            },
          },
        },
        subscriptions: {
          where: { status: 'active' },
          select: {
            id: true,
            status: true,
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
                maxProducts: true,
                features: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return apiSuccess({
      ...user,
      subscriptions: user.subscriptions.map(sub => ({
        ...sub,
        plan: {
          ...sub.plan,
          price: Number(sub.plan.price),
          features: sub.plan.features,
        },
      })),
    }, 200, request);
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Error al obtener usuario', 500, undefined, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'avatar'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingDone: true,
        avatar: true,
        phone: true,
      },
    });

    return apiSuccess(user, 200, request);
  } catch (error) {
    console.error('Update user error:', error);
    return apiError('Error al actualizar usuario', 500, undefined, request);
  }
}
'''
write_file(f'{BASE}/src/app/api/user/route.ts', user_route)

# ==========================================
# 9. FIX user/onboarding/route.ts
# ==========================================
print("\n[9] Fixing onboarding route...")

onboarding_route = '''import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error || !auth.user) {
      return apiError('No autorizado', 401, undefined, request);
    }

    const userId = auth.user.userId;

    await db.user.update({
      where: { id: userId },
      data: { onboardingDone: true },
    });

    return apiSuccess({ message: 'Onboarding completado', onboardingDone: true }, 200, request);
  } catch (error) {
    console.error('Onboarding error:', error);
    return apiError('Error al actualizar onboarding', 500, undefined, request);
  }
}
'''
write_file(f'{BASE}/src/app/api/user/onboarding/route.ts', onboarding_route)

# ==========================================
# 10. FIX mock-data.ts - Add missing yape/plin fields
# ==========================================
print("\n[10] Fixing mock data...")

mock_data = read_file(f'{BASE}/src/lib/mock-data.ts')

# Add yape/plin fields to each MOCK_STORES entry
mock_data = mock_data.replace(
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n  },\n  {\n    id: 'store-2'",
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,\n  },\n  {\n    id: 'store-2'"
)
mock_data = mock_data.replace(
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n  },\n  {\n    id: 'store-3'",
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,\n  },\n  {\n    id: 'store-3'"
)
mock_data = mock_data.replace(
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n  },\n  {\n    id: 'store-4'",
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,\n  },\n  {\n    id: 'store-4'"
)
mock_data = mock_data.replace(
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n  },\n]",
    "    popupEnabled: false, popupType: 'product', popupProductId: null, popupCustomImage: null, popupTitle: null, popupButtonText: 'Ver oferta',\n    yapeQrUrl: null, plinQrUrl: null, yapeNumber: null, plinNumber: null,\n  },\n]"
)

write_file(f'{BASE}/src/lib/mock-data.ts', mock_data)

# ==========================================
# 11. FIX seed.ts - Use correct model names and fields
# ==========================================
print("\n[11] Fixing seed file...")

seed_content = '''import { db } from '../src/lib/db';

async function seed() {
  // Create demo stores for each template
  const templates = [
    {
      slug: 'demo-moderna',
      name: 'Tienda Moderna',
      description: 'Una tienda moderna con diseño limpio y elegante. Perfecta para moda y accesorios.',
      template: 'moderna',
      logo: '/demo/moderna-logo.png',
      bannerUrl: '/demo/moderna-banner.jpg',
      whatsappNumber: '+51999888777',
      category: 'moda',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-vibrante',
      name: 'Tienda Vibrante',
      description: 'Una tienda llena de color y energía. Ideal para productos artesanales y creativos.',
      template: 'vibrante',
      logo: '/demo/vibrante-logo.png',
      bannerUrl: '/demo/vibrante-banner.jpg',
      whatsappNumber: '+51999888778',
      category: 'artesanias',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-clasica',
      name: 'Tienda Clásica',
      description: 'Un diseño clásico y atemporal. Perfecta para productos gourmet y delicatessen.',
      template: 'clasica',
      logo: '/demo/clasica-logo.png',
      bannerUrl: '/demo/clasica-banner.jpg',
      whatsappNumber: '+51999888779',
      category: 'gourmet',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-luxury',
      name: 'Tienda Luxury',
      description: 'Elegancia y sofisticación en cada detalle. Para marcas premium y exclusivas.',
      template: 'luxury',
      logo: '/demo/luxury-logo.png',
      bannerUrl: '/demo/luxury-banner.jpg',
      whatsappNumber: '+51999888780',
      category: 'premium',
      isDemo: true,
      ownerId: 'demo-owner',
    },
    {
      slug: 'demo-minimalist',
      name: 'Tienda Minimalista',
      description: 'Menos es más. Un diseño minimalista que destaca tus productos.',
      template: 'minimalist',
      logo: '/demo/minimalist-logo.png',
      bannerUrl: '/demo/minimalist-banner.jpg',
      whatsappNumber: '+51999888781',
      category: 'tech',
      isDemo: true,
      ownerId: 'demo-owner',
    },
  ];

  // Create demo owner user first
  const existingOwner = await db.user.findUnique({ where: { email: 'demo@tiendapp.pe' } });
  let ownerId: string;
  
  if (!existingOwner) {
    const owner = await db.user.create({
      data: {
        name: 'Demo Owner',
        email: 'demo@tiendapp.pe',
        password: '$2a$12$DEMOPASSWORDNOTFORPRODUCTION',
        role: 'store_owner',
        onboardingDone: true,
      },
    });
    ownerId = owner.id;
  } else {
    ownerId = existingOwner.id;
  }

  // Update templates with actual ownerId
  const storeData = templates.map(t => ({ ...t, ownerId }));

  for (const data of storeData) {
    const existing = await db.store.findUnique({ where: { slug: data.slug } });
    if (existing) {
      console.log(`Store ${data.slug} already exists, skipping...`);
      continue;
    }

    const store = await db.store.create({ data });

    // Create categories for each store
    const categories = [
      { name: 'Productos Destacados', icon: 'star', storeId: store.id },
      { name: 'Novedades', icon: 'sparkles', storeId: store.id },
      { name: 'Más Vendidos', icon: 'trending-up', storeId: store.id },
    ];

    for (const cat of categories) {
      await db.category.create({ data: cat });
    }

    // Create products for each store using StoreProduct model
    const products = [
      { name: 'Producto Destacado 1', description: 'Un producto increíble que no puedes dejar pasar.', price: 59.99, imageUrl: '/demo/product-1.jpg', category: 'Productos Destacados', storeId: store.id },
      { name: 'Producto Destacado 2', description: 'Calidad premium a un precio accesible.', price: 89.99, imageUrl: '/demo/product-2.jpg', category: 'Productos Destacados', storeId: store.id },
      { name: 'Producto Nuevo 1', description: 'Lo último en tendencias, recién llegado.', price: 45.00, imageUrl: '/demo/product-3.jpg', category: 'Novedades', storeId: store.id },
      { name: 'Producto Nuevo 2', description: 'Innovación y estilo en un solo producto.', price: 75.00, imageUrl: '/demo/product-4.jpg', category: 'Novedades', storeId: store.id },
      { name: 'Best Seller 1', description: 'El favorito de nuestros clientes.', price: 39.99, imageUrl: '/demo/product-5.jpg', category: 'Más Vendidos', storeId: store.id },
      { name: 'Best Seller 2', description: 'Un clásico que nunca pasa de moda.', price: 64.99, imageUrl: '/demo/product-6.jpg', category: 'Más Vendidos', storeId: store.id },
    ];

    for (const prod of products) {
      await db.storeProduct.create({ data: prod });
    }

    console.log(`Created store: ${store.slug} with categories and products`);
  }

  console.log('Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
'''
write_file(f'{BASE}/prisma/seed.ts', seed_content)

print("\n✅ All code fixes applied!")
print("Next step: Run 'npx prisma generate' and then 'npm run build'")
