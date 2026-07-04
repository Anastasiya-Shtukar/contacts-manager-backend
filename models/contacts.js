const mongoose = require("mongoose");
const Contact = require("./contactsSchema.js");

const listContacts = async (owner) => {
  return await Contact.find({ owner });
};

const getContactById = async (contactId, owner) => {
  return await Contact.findOne({ _id: contactId, owner });
};

const removeContact = async (contactId, owner) => {
  return await Contact.findOneAndDelete({ _id: contactId, owner });
};

const addContact = async (data) => {
  return await Contact.create(data);
};

const updateContact = async (contactId, data, owner) => {
  return await Contact.findOneAndUpdate({ _id: contactId, owner }, data, {
    new: true,
    runValidators: true,
  });
};

const updateStatusContact = async (contactId, favorite, owner) => {
  return await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    { favorite },
    { new: true, runValidators: true },
  );
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
