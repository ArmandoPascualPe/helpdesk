/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ngaqu6iylsgki1h",
    "created": "2026-04-08 13:02:06.561Z",
    "updated": "2026-04-08 13:02:06.561Z",
    "name": "tickets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fta2fbyj",
        "name": "ticket_number",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ngaqu6iylsgki1h");

  return dao.deleteCollection(collection);
})
