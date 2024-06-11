import type { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'

export const PAGE_FTS_TABLE = 'pages_fts'
export const ANNOT_FTS_TABLE = 'annotations_fts'

function getConnection(backend: TypeORMStorageBackend) {
    if (backend.connection == null) {
        throw new Error('TypeORM connection not yet established')
    }
    return backend.connection
}

export async function setupFTSTables(backend: TypeORMStorageBackend) {
    const connection = getConnection(backend)
    await connection.transaction(async (tx) => {
        await tx.query(
            `CREATE VIRTUAL TABLE IF NOT EXISTS ${PAGE_FTS_TABLE} USING fts4(content="pages", url, fullTitle, text);`,
        )
        await tx.query(
            `CREATE VIRTUAL TABLE IF NOT EXISTS ${ANNOT_FTS_TABLE} USING fts4(content="annotations", url, body, comment);`,
        )

        // Create triggers to keep the FTS tables in-sync with their counterparts
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS pages_insert_trigger AFTER INSERT ON pages
            BEGIN
                INSERT INTO ${PAGE_FTS_TABLE} (docid, url, fullTitle, text)
                VALUES(new.rowid, new.url, new.fullTitle, new.text);
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS pages_delete_trigger BEFORE DELETE ON pages
            BEGIN
                DELETE FROM ${PAGE_FTS_TABLE}
                WHERE docid = old.rowid;
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS pages_update_before_trigger AFTER UPDATE ON pages
            BEGIN
                DELETE FROM ${PAGE_FTS_TABLE}
                WHERE docid = old.rowid;
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS pages_update_after_trigger AFTER UPDATE ON pages
            BEGIN
                INSERT INTO ${PAGE_FTS_TABLE}(docid, url, fullTitle, text)
                VALUES(new.rowid, new.url, new.fullTitle, new.text);
            END;
        `)

        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS annotations_insert_trigger AFTER INSERT ON annotations
            BEGIN
                INSERT INTO ${ANNOT_FTS_TABLE} (docid, url, body, comment)
                VALUES(new.rowid, new.url, new.body, new.comment);
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS annotations_delete_trigger BEFORE DELETE ON annotations
            BEGIN
                DELETE FROM ${ANNOT_FTS_TABLE}
                WHERE docid = old.rowid;
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS annotations_update_before_trigger BEFORE UPDATE ON annotations
            BEGIN
                DELETE FROM ${ANNOT_FTS_TABLE}
                WHERE docid = old.rowid;
            END;
        `)
        await tx.query(`
            CREATE TRIGGER IF NOT EXISTS annotations_update_after_trigger AFTER UPDATE ON annotations
            BEGIN
                INSERT INTO ${ANNOT_FTS_TABLE}(docid, url, body, comment)
                VALUES(new.rowid, new.url, new.body, new.comment);
            END;
        `)
    })
}

export async function seedFTSTables(backend: TypeORMStorageBackend) {
    const connection = getConnection(backend)
    await connection.transaction(async (tx) => {
        await tx.query(`
            INSERT OR IGNORE INTO ${PAGE_FTS_TABLE}(docid, url, fullTitle, text)
            SELECT rowid, url, fullTitle, text FROM pages;
        `)
        await tx.query(`
            INSERT OR IGNORE INTO ${ANNOT_FTS_TABLE}(docid, url, body, comment)
            SELECT rowid, url, body, comment FROM annotations;
        `)
    })
}

export async function dropFTSTables(backend: TypeORMStorageBackend) {
    const connection = getConnection(backend)
    await connection.transaction(async (tx) => {
        await tx.query(`DROP TABLE ${ANNOT_FTS_TABLE};`)
        await tx.query(`DROP TABLE ${PAGE_FTS_TABLE};`)

        await tx.query(`DROP TRIGGER pages_insert_trigger;`)
        await tx.query(`DROP TRIGGER pages_delete_trigger;`)
        await tx.query(`DROP TRIGGER pages_update_before_trigger;`)
        await tx.query(`DROP TRIGGER pages_update_after_trigger;`)
        await tx.query(`DROP TRIGGER annotations_insert_trigger;`)
        await tx.query(`DROP TRIGGER annotations_delete_trigger;`)
        await tx.query(`DROP TRIGGER annotations_update_before_trigger;`)
        await tx.query(`DROP TRIGGER annotations_update_after_trigger;`)
    })
}
