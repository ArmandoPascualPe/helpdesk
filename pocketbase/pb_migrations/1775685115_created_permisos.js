/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "vf1k1f6aikynog5",
    "created": "2026-04-08 21:51:55.018Z",
    "updated": "2026-04-08 21:51:55.018Z",
    "name": "permisos",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vknuusly",
        "name": "rol",
        "type": "select",
        "required": true,
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
        "id": "5mnlscgu",
        "name": "puede_crear_tickets",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "3oafroft",
        "name": "puede_ver_todos_tickets",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "itihlcls",
        "name": "puede_ver_tickets_asignados",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "8knklbzs",
        "name": "puede_cambiar_estado",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "kvdgimhs",
        "name": "puede_agregar_comentarios",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "rr4hqed9",
        "name": "puede_reasignar",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "fnonntol",
        "name": "puede_ver_dashboard",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "ajjh6zlu",
        "name": "puede_gestionar_usuarios",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "c2c0gwhh",
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
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vf1k1f6aikynog5");

  return dao.deleteCollection(collection);
})
