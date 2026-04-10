/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "6l1ulthfkhe2pw8",
    "created": "2026-04-08 17:48:22.275Z",
    "updated": "2026-04-08 17:48:22.275Z",
    "name": "usuarios",
    "type": "auth",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ykf84qwa",
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
        "id": "artymvmr",
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
        "id": "bymw74ah",
        "name": "rol",
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
        "id": "6yggjoee",
        "name": "departamento",
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
    "options": {
      "allowEmailAuth": true,
      "allowOAuth2Auth": false,
      "allowUsernameAuth": true,
      "exceptEmailDomains": null,
      "manageRule": null,
      "minPasswordLength": 8,
      "onlyEmailDomains": null,
      "onlyVerified": false,
      "requireEmail": false
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("6l1ulthfkhe2pw8");

  return dao.deleteCollection(collection);
})
