const { Customer, CUSTOMER_TAGS, ACCOUNT_STATUS } = require('../models/Customer');

const toCustomerResponse = (c) => ({
  id: c._id,
  organizationName: c.organizationName,
  contactDetails: c.contactDetails,
  region: c.region,
  industry: c.industry,
  accountStatus: c.accountStatus,
  tags: c.tags,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

const listCustomers = async (req, res, next) => {
  try {
    const { search, region, industry, accountStatus, tags } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { organizationName: { $regex: search, $options: 'i' } },
        { 'contactDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (region) query.region = region;
    if (industry) query.industry = industry;
    if (accountStatus) query.accountStatus = accountStatus;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { customers: customers.map(toCustomerResponse) },
    });
  } catch (err) {
    next(err);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      data: { customer: toCustomerResponse(customer) },
    });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { organizationName, contactDetails, region, industry, accountStatus, tags } = req.body;

    const customer = await Customer.create({
      organizationName: organizationName?.trim(),
      contactDetails: {
        email: contactDetails?.email?.trim().toLowerCase() || '',
        phone: contactDetails?.phone?.trim() || '',
        address: contactDetails?.address?.trim() || '',
      },
      region: region?.trim() || '',
      industry: industry?.trim() || '',
      accountStatus: accountStatus || ACCOUNT_STATUS.ACTIVE,
      tags: tags || [],
    });

    const created = await Customer.findById(customer._id).lean();
    res.status(201).json({
      success: true,
      data: { customer: toCustomerResponse(created) },
    });
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { organizationName, contactDetails, region, industry, accountStatus, tags } = req.body;

    const update = {};
    if (organizationName !== undefined) update.organizationName = organizationName?.trim();
    if (region !== undefined) update.region = region?.trim();
    if (industry !== undefined) update.industry = industry?.trim();
    if (accountStatus !== undefined) update.accountStatus = accountStatus;
    if (tags !== undefined) update.tags = tags;

    if (contactDetails !== undefined) {
      if (contactDetails.email !== undefined)
        update['contactDetails.email'] = contactDetails.email?.trim().toLowerCase() || '';
      if (contactDetails.phone !== undefined)
        update['contactDetails.phone'] = contactDetails.phone?.trim() || '';
      if (contactDetails.address !== undefined)
        update['contactDetails.address'] = contactDetails.address?.trim() || '';
    }

    const updated = await Customer.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      data: { customer: toCustomerResponse(updated) },
    });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
