/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "n2wwy0n4jp9ee5b",
    "created": "2026-04-08 12:08:30.258Z",
    "updated": "2026-04-08 12:08:30.258Z",
    "name": "post",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "x17yjcbz",
        "name": "field",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "jdjabtgx",
        "name": "field2",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
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
  const collection = dao.findCollectionByNameOrId("n2wwy0n4jp9ee5b");

  return dao.deleteCollection(collection);
})
