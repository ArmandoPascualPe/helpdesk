/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zqnn1qx2jtxjzij")

  collection.listRule = "id = @request.auth.collectionId"
  collection.createRule = ""
  collection.updateRule = "id = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zqnn1qx2jtxjzij")

  collection.listRule = null
  collection.createRule = null
  collection.updateRule = null

  return dao.saveCollection(collection)
})
