const INDEX_NAME = 'uniqueName';

const createIndex = async (collection) => {
  await collection.createIndex(
    { name: 1}, 
    { unique: true, name: INDEX_NAME }
  );
}

const ensureUniqueNameIndex = async (collection) => {
  try {
    const indexExists = await collection.indexExists(INDEX_NAME);
    if (!indexExists) {
      createIndex(collection);
    }
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      await createIndex(collection);
    } else {
      throw err;
    }
  }
};

module.exports = ensureUniqueNameIndex;