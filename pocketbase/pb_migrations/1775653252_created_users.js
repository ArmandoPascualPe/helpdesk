/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "zqnn1qx2jtxjzij",
    "created": "2026-04-08 13:00:52.554Z",
    "updated": "2026-04-08 13:00:52.554Z",
    "name": "users",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "qkdt9zvx",
        "name": "rol",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "clente",
            "agente",
            "supervisor"
          ]
        }
      },
      {
        "system": false,
        "id": "4hqgwltm",
        "name": "departament",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "scuru1ltlc7pm87",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
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
  const collection = dao.findCollectionByNameOrId("zqnn1qx2jtxjzij");

  return dao.deleteCollection(collection);
})
