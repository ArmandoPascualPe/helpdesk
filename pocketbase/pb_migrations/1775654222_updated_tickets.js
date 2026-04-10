/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ngaqu6iylsgki1h")

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ngaqu6iylsgki1h")

  // remove
  collection.schema.removeField("xhwmazle")

  // remove
  collection.schema.removeField("y0njl7sj")

  // remove
  collection.schema.removeField("yvt2vp47")

  // remove
  collection.schema.removeField("yzxp8oqt")

  // remove
  collection.schema.removeField("7ccec64x")

  // remove
  collection.schema.removeField("er73pxeo")

  // remove
  collection.schema.removeField("skpfeino")

  // remove
  collection.schema.removeField("z2ui5ddb")

  // remove
  collection.schema.removeField("bbl6irly")

  return dao.saveCollection(collection)
})
