/**
 * Persistencia del proyecto del emprendedor en Postgres.
 *
 * Traduce entre el `ProjectState` que usa la app y las tablas normalizadas del
 * esquema. Guardar reemplaza las filas hijas dentro de una transacción: un
 * proyecto es de un solo usuario y cabe entero, así que no hace falta un diff
 * fino y sí hace falta que nunca quede a medias.
 */

import type { PrismaClient } from '@prisma/client';
import { getPrisma } from '../licensing/prismaStore';
import { emptyProjectState, safeAccent, type ProjectState } from '@/domain/projectState';
import type { Ingredient } from '@/domain/types';
import type { UnitCode } from '@/domain/units';
import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';

export interface ProjectRepository {
  load(userId: string): Promise<ProjectState | undefined>;
  save(userId: string, state: ProjectState): Promise<void>;
  /** Momento del primer arranque del proyecto: base de la prueba de 7 días. */
  trialStart(userId: string): Promise<number | undefined>;
}

function ingredientRows(ingredients: Ingredient[], key: 'dishId' | 'subrecipeId', ownerId: string) {
  return ingredients.map((ingredient, position) => ({
    [key]: ownerId,
    name: ingredient.name,
    qty: ingredient.qty,
    unit: ingredient.unit,
    buyPrice: ingredient.buyPrice ?? null,
    buyQty: ingredient.buyQty ?? null,
    buyUnit: ingredient.buyUnit ?? null,
    unitPrice: ingredient.unitPrice ?? null,
    waste: ingredient.waste ?? 0,
    position,
    // La sub-receta referenciada se guarda por su id de dominio y se vuelve a
    // resolver al cargar.
    sourceSubrecipeId: null as string | null,
    subrecipeRef: ingredient.subrecipeId ?? null,
  }));
}

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private db: PrismaClient = getPrisma()) {}

  async trialStart(userId: string): Promise<number | undefined> {
    const project = await this.db.project.findUnique({ where: { userId }, select: { trialStartedAt: true } });
    return project?.trialStartedAt.getTime();
  }

  async load(userId: string): Promise<ProjectState | undefined> {
    const project = await this.db.project.findUnique({
      where: { userId },
      include: {
        completedTasks: true,
        skippedModules: true,
        extraTasks: { orderBy: { position: 'asc' } },
        dishes: { include: { ingredients: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } },
        subrecipes: { include: { ingredients: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } },
        budgetItems: { include: { subconcepts: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } },
        fixedItems: { orderBy: { position: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        suppliers: true,
      },
    });
    if (!project) return undefined;

    const user = await this.db.user.findUnique({ where: { id: userId } });
    const base = emptyProjectState();

    return {
      ...base,
      profile: {
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: (project.settings as Record<string, unknown>)?.phone as string ?? '',
        city: (project.settings as Record<string, unknown>)?.city as string ?? '',
      },
      project: {
        name: project.name,
        giro: project.giro,
        budgetCap: project.budgetCap,
        openDate: project.targetDate ?? '',
        people: project.headcount ?? '',
      },
      answers: (project.answers as Record<string, string>) ?? {},
      done: Object.fromEntries(project.completedTasks.map((t) => [t.taskKey, true])),
      skipped: Object.fromEntries(project.skippedModules.map((m) => [m.moduleId, m.reason])),
      extraTasks: project.extraTasks.map((t) => ({
        id: t.id,
        moduleId: t.moduleId,
        title: t.title,
        hint: t.hint ?? '',
      })),
      dishes: project.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        portions: dish.portions,
        extrasPct: dish.extrasPct,
        packaging: dish.packaging,
        labor: dish.labor,
        priceIncludesTax: dish.priceIncludesTax,
        deliveryCommission: dish.deliveryCommission,
        section: dish.section as ProjectState['dishes'][number]['section'],
        popularity: dish.popularity as ProjectState['dishes'][number]['popularity'],
        star: dish.star,
        ingredients: dish.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          qty: ingredient.qty,
          unit: ingredient.unit as UnitCode,
          buyPrice: ingredient.buyPrice ?? undefined,
          buyQty: ingredient.buyQty ?? undefined,
          buyUnit: (ingredient.buyUnit as UnitCode) ?? undefined,
          unitPrice: ingredient.unitPrice ?? undefined,
          waste: ingredient.waste,
          subrecipeId: ingredient.sourceSubrecipeId ?? undefined,
        })),
      })),
      subrecipes: project.subrecipes.map((sub) => ({
        id: sub.id,
        name: sub.name,
        yieldQty: sub.yieldQty,
        unit: sub.unit as UnitCode,
        ingredients: sub.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          qty: ingredient.qty,
          unit: ingredient.unit as UnitCode,
          buyPrice: ingredient.buyPrice ?? undefined,
          buyQty: ingredient.buyQty ?? undefined,
          buyUnit: (ingredient.buyUnit as UnitCode) ?? undefined,
          unitPrice: ingredient.unitPrice ?? undefined,
          waste: ingredient.waste,
          subrecipeId: ingredient.sourceSubrecipeId ?? undefined,
        })),
      })),
      budget: project.budgetItems.length
        ? project.budgetItems.map((item) => ({
            key: item.key,
            label: item.label,
            amount: item.amount,
            ...(item.custom ? { custom: true } : {}),
          }))
        : BUDGET_CONCEPTS.map((c) => ({ ...c, amount: 0 })),
      budgetSub: Object.fromEntries(
        project.budgetItems
          .filter((item) => item.subconcepts.length)
          .map((item) => [
            item.key,
            item.subconcepts.map((sub) => ({ id: sub.id, label: sub.label, amount: sub.amount })),
          ]),
      ),
      fixed: project.fixedItems.length
        ? project.fixedItems.map((item) => ({
            key: item.key,
            label: item.label,
            amount: item.amount,
            ...(item.custom ? { custom: true } : {}),
          }))
        : FIXED_CONCEPTS.map((c) => ({ ...c, amount: 0 })),
      notes: project.notes.map((note) => ({
        id: note.id,
        title: note.title,
        body: note.body,
        date: note.createdAt.toLocaleDateString('es-MX'),
      })),
      suppliers: project.suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        item: supplier.item,
        contact: supplier.contact,
        terms: supplier.terms,
        delivery: supplier.delivery,
      })),
      ticket: project.ticket,
      margin: project.margin,
      ownerGoal: project.ownerGoal,
      hours: project.hours,
      closedOneDay: project.closedOneDay,
      weeklyHours: project.weeklyHours,
      prepMinutes: project.prepMinutes,
      dailyMix: project.dailyMix,
      capacity: {
        ordersPerHour: project.ordersPerHour,
        peakHours: project.peakHours,
        seats: project.seats,
      },
      stress: {
        supplies: project.stressSupplies,
        rent: project.stressRent,
        sales: project.stressSales,
      },
      delivery: { ...base.delivery, ...((project.delivery as Record<string, unknown>) ?? {}) } as ProjectState['delivery'],
      ads: { ...base.ads, ...((project.ads as Record<string, unknown>) ?? {}) } as ProjectState['ads'],
      ignoredActions: {
        ...((project.ignoredActions as Record<string, boolean>) ?? {}),
      },
      fcTarget: project.fcTarget,
      layout: project.layout,
      settings: (() => {
        const guardados = { ...base.settings, ...((project.settings as Record<string, unknown>) ?? {}) };
        // El acento se repone si lo guardado no es un color.
        return { ...guardados, accent: safeAccent(guardados.accent) } as ProjectState['settings'];
      })(),
    };
  }

  async save(userId: string, state: ProjectState): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const project = await tx.project.upsert({
        where: { userId },
        update: {
          name: state.project.name,
          giro: state.project.giro,
          budgetCap: Math.round(state.project.budgetCap),
          targetDate: state.project.openDate,
          headcount: state.project.people,
          answers: state.answers,
          settings: { ...state.settings, phone: state.profile.phone, city: state.profile.city },
          ticket: Math.round(state.ticket),
          margin: Math.round(state.margin),
          ownerGoal: Math.round(state.ownerGoal),
          hours: Math.round(state.hours),
          closedOneDay: state.closedOneDay,
          weeklyHours: Math.round(state.weeklyHours),
          prepMinutes: Math.round(state.prepMinutes),
          dailyMix: Math.round(state.dailyMix),
          ordersPerHour: Math.round(state.capacity.ordersPerHour),
          peakHours: Math.round(state.capacity.peakHours),
          seats: Math.round(state.capacity.seats),
          stressSupplies: Math.round(state.stress.supplies),
          stressRent: Math.round(state.stress.rent),
          stressSales: Math.round(state.stress.sales),
          delivery: { ...state.delivery },
          ads: { ...state.ads },
          ignoredActions: { ...state.ignoredActions },
          fcTarget: Math.round(state.fcTarget),
          layout: state.layout,
        },
        create: {
          userId,
          name: state.project.name,
          giro: state.project.giro,
          budgetCap: Math.round(state.project.budgetCap),
          targetDate: state.project.openDate,
          headcount: state.project.people,
          answers: state.answers,
          settings: { ...state.settings, phone: state.profile.phone, city: state.profile.city },
          ticket: Math.round(state.ticket),
          margin: Math.round(state.margin),
          ownerGoal: Math.round(state.ownerGoal),
          hours: Math.round(state.hours),
          closedOneDay: state.closedOneDay,
          weeklyHours: Math.round(state.weeklyHours),
          prepMinutes: Math.round(state.prepMinutes),
          dailyMix: Math.round(state.dailyMix),
          ordersPerHour: Math.round(state.capacity.ordersPerHour),
          peakHours: Math.round(state.capacity.peakHours),
          seats: Math.round(state.capacity.seats),
          stressSupplies: Math.round(state.stress.supplies),
          stressRent: Math.round(state.stress.rent),
          stressSales: Math.round(state.stress.sales),
          delivery: { ...state.delivery },
          ads: { ...state.ads },
          ignoredActions: { ...state.ignoredActions },
          fcTarget: Math.round(state.fcTarget),
          layout: state.layout,
        },
      });

      const projectId = project.id;

      // El nombre del usuario vive en su cuenta, no en el proyecto.
      if (state.profile.name.trim()) {
        await tx.user.update({ where: { id: userId }, data: { name: state.profile.name.trim() } });
      }

      await tx.completedTask.deleteMany({ where: { projectId } });
      const doneKeys = Object.entries(state.done)
        .filter(([, done]) => done)
        .map(([taskKey]) => ({ projectId, taskKey }));
      if (doneKeys.length) await tx.completedTask.createMany({ data: doneKeys });

      await tx.skippedModule.deleteMany({ where: { projectId } });
      const skipped = Object.entries(state.skipped).map(([moduleId, reason]) => ({ projectId, moduleId, reason }));
      if (skipped.length) await tx.skippedModule.createMany({ data: skipped });

      await tx.extraTask.deleteMany({ where: { projectId } });
      for (const [position, task] of state.extraTasks.entries()) {
        await tx.extraTask.create({
          data: { id: task.id, projectId, moduleId: task.moduleId, title: task.title, hint: task.hint, position },
        });
      }

      // Sub-recetas primero: los platillos las referencian.
      await tx.subrecipe.deleteMany({ where: { projectId } });
      const subrecipeIds = new Map<string, string>();
      for (const [position, sub] of state.subrecipes.entries()) {
        const row = await tx.subrecipe.create({
          data: { projectId, name: sub.name, yieldQty: sub.yieldQty, unit: sub.unit, position },
        });
        subrecipeIds.set(sub.id, row.id);
      }
      for (const sub of state.subrecipes) {
        const ownerId = subrecipeIds.get(sub.id) as string;
        for (const row of ingredientRows(sub.ingredients, 'subrecipeId', ownerId)) {
          const { subrecipeRef, ...data } = row;
          await tx.ingredient.create({
            data: { ...data, sourceSubrecipeId: subrecipeRef ? (subrecipeIds.get(subrecipeRef) ?? null) : null },
          });
        }
      }

      await tx.dish.deleteMany({ where: { projectId } });
      for (const [position, dish] of state.dishes.entries()) {
        const row = await tx.dish.create({
          data: {
            projectId,
            name: dish.name,
            price: dish.price,
            portions: dish.portions ?? 1,
            extrasPct: dish.extrasPct ?? 3,
            packaging: dish.packaging ?? 0,
            labor: dish.labor ?? 0,
            priceIncludesTax: dish.priceIncludesTax ?? true,
            deliveryCommission: dish.deliveryCommission ?? 28,
            section: dish.section ?? 'Fuertes',
            popularity: dish.popularity ?? 'media',
            star: dish.star ?? false,
            position,
          },
        });
        for (const ingredient of ingredientRows(dish.ingredients, 'dishId', row.id)) {
          const { subrecipeRef, ...data } = ingredient;
          await tx.ingredient.create({
            data: { ...data, sourceSubrecipeId: subrecipeRef ? (subrecipeIds.get(subrecipeRef) ?? null) : null },
          });
        }
      }

      await tx.budgetItem.deleteMany({ where: { projectId } });
      for (const [position, concept] of state.budget.entries()) {
        const row = await tx.budgetItem.create({
          data: {
            projectId,
            key: concept.key,
            label: concept.label,
            amount: concept.amount,
            custom: !!concept.custom,
            position,
          },
        });
        const subs = state.budgetSub[concept.key] ?? [];
        for (const [subPosition, sub] of subs.entries()) {
          await tx.subconcept.create({
            data: { budgetItemId: row.id, label: sub.label, amount: sub.amount, position: subPosition },
          });
        }
      }

      await tx.fixedItem.deleteMany({ where: { projectId } });
      for (const [position, concept] of state.fixed.entries()) {
        await tx.fixedItem.create({
          data: {
            projectId,
            key: concept.key,
            label: concept.label,
            amount: concept.amount,
            custom: !!concept.custom,
            position,
          },
        });
      }

      await tx.note.deleteMany({ where: { projectId } });
      for (const note of state.notes) {
        await tx.note.create({ data: { projectId, title: note.title, body: note.body } });
      }

      await tx.supplier.deleteMany({ where: { projectId } });
      for (const supplier of state.suppliers) {
        await tx.supplier.create({
          data: {
            projectId,
            name: supplier.name,
            item: supplier.item,
            contact: supplier.contact,
            terms: supplier.terms,
            delivery: supplier.delivery,
          },
        });
      }
    });
  }
}

const globalForProject = globalThis as unknown as { mrlProjectRepository?: ProjectRepository };

export function getProjectRepository(): ProjectRepository {
  globalForProject.mrlProjectRepository ??= new PrismaProjectRepository();
  return globalForProject.mrlProjectRepository;
}

export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes('user:password@localhost');
}
