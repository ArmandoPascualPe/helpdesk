/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ngaqu6iylsgki1h");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ngaqu6iylsgki1h",
    "created": "2026-04-08 13:02:06.561Z",
    "updated": "2026-04-08 13:17:02.947Z",
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
      },
      {
        "system": false,
        "id": "xhwmazle",
        "name": "title",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "y0njl7sj",
        "name": "description",
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
        "id": "yvt2vp47",
        "name": "priority",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "baja",
            "media",
            "alta",
            "critica"
          ]
        }
      },
      {
        "system": false,
        "id": "yzxp8oqt",
        "name": "category",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "hardware",
            "software",
            "red",
            "otros"
          ]
        }
      },
      {
        "system": false,
        "id": "7ccec64x",
        "name": "status",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "nuevo",
            "en_proceso",
            "en_espera",
            "resuelto",
            "reabierto",
            "cerrado"
          ]
        }
      },
      {
        "system": false,
        "id": "er73pxeo",
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
      },
      {
        "system": false,
        "id": "skpfeino",
        "name": "created_by",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "zqnn1qx2jtxjzij",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "z2ui5ddb",
        "name": "asigned_to",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "zqnn1qx2jtxjzij",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "bbl6irly",
        "name": "closed_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
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
})
