import { TValidator } from "../../types/validator";
import * as v from "../../lib/validators"
import { db } from "../../loaders/psql";
import { notificationEntity } from "../../config/schema";
import { TNotifier } from "../../types/notifier";
import { eq } from "drizzle-orm";

export const create = async (name: string, type: TNotifier, addInfo: any) => {
    const [notifier] = await db.insert(notificationEntity).values({
        name: name,
        type,
        additionalInfo: addInfo
    }).returning({ id: notificationEntity.id })

    return notifier.id
}

export const update = async (name: string, type: TNotifier, addInfo: any, id: string) => {
    const [notifier] = await db.update(notificationEntity).set({
        name: name,
        type,
        additionalInfo: addInfo
    }).where(eq(notificationEntity.id, id)).returning({
        id: notificationEntity.id
    })
    return notifier.id
}

export const getById = async (id: string) => {
    const [notifier] = await db.select().from(notificationEntity).where(eq(notificationEntity.id, id))
    return notifier
}

export const deleteNotifiers = async (id: string) => {
    await db.delete(notificationEntity).where(eq(notificationEntity.id, id))
}
export const validate = (type: string, obj: any): TValidator => {
    switch (type) {
        case "http": {
            return v.validateTelegram(obj)
        }
        default:
            return {
                success: false,
                err: "No such monitor type"
            }
    }
}