/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "c52lwmavhzig70t",
    "created": "2026-04-08 17:48:48.374Z",
    "updated": "2026-04-08 17:48:48.374Z",
    "name": "tickets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "stopcuuy",
        "name": "titulo",
        "type": "text",
        "required": true,
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
        "id": "hodx1uvb",
        "name": "descripcion",
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
        "id": "iqb7bck6",
        "name": "prioridad",
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
        "id": "kq4q1nfy",
        "name": "categoria",
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
        "id": "m64edpbn",
        "name": "estado",
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
        "id": "nruvbko2",
        "name": "departamento",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "p33vc2ubsegdwax",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "g9bxa9za",
        "name": "creado_por",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "6l1ulthfkhe2pw8",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "tsmzmm6a",
        "name": "asignado_a",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "6l1ulthfkhe2pw8",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "xl96zsui",
        "name": "cerrado_en",
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
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("c52lwmavhzig70t");

  return dao.deleteCollection(collection);
})
