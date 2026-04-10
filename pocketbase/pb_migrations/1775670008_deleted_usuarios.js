/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("gn47kcb3cazlgav");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "gn47kcb3cazlgav",
    "created": "2026-04-08 15:19:19.755Z",
    "updated": "2026-04-08 16:24:28.823Z",
    "name": "usuarios",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dbhhmphn",
        "name": "email",
        "type": "email",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": [],
          "onlyDomains": []
        }
      },
      {
        "system": false,
        "id": "jdlxnevp",
        "name": "username",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "uiqeeu8b",
        "name": "first_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "hcvyvvfn",
        "name": "last_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "cvxyaasw",
        "name": "role",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "cliente",
            "agente",
            "supervisor"
          ]
        }
      },
      {
        "system": false,
        "id": "7ivcbzm5",
        "name": "password",
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
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "id =@request.auth.id",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
