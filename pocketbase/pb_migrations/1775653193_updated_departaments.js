/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("scuru1ltlc7pm87")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ppwpxl0h",
    "name": "active",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("scuru1ltlc7pm87")

  // remove
  collection.schema.removeField("ppwpxl0h")

  return dao.saveCollection(collection)
})
