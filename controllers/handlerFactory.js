import catchAsync from "../utilis/catchAsync.js";
import { appError } from "../utilis/appError.js";
import { filterObj } from "../utilis/filterObj.js";
import { apiFeatures } from "../utilis/apiFeatures.js";

// CRUD factory

// Delete
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(
        new appError(`No ${Model.modelName} found with this ID`, 404)
      );
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

// update
export const updateOne = (Model, allowedFields) =>
  catchAsync(async (req, res, next) => {
    let filteredbody = req.body;
    if (allowedFields) filteredbody = filterObj(req.body, allowedFields);
    if (Object.keys(filteredbody).length === 0) {
      return next(new appError("No valid fields provided for update", 400));
    }
    const modelName = Model.modelName;

    let updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      filteredbody,
      {
        runValidators: true,
        new: true,
      }
    );
    if (!updatedDocument) {
      return next(new appError(`No ${modelName} found with this ID`, 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        document: updatedDocument,
      },
    });
  });

// create
export const createOne = (Model, allowedFields) =>
  catchAsync(async (req, res, next) => {
    let filteredbody = req.body;
    if (allowedFields) filteredbody = filterObj(req.body, allowedFields);
    let newDocument = await Model.create(filteredbody);
    res.status(201).json({
      status: "success",
      data: {
        document: newDocument,
      },
    });
  });

// read specific one
export const readOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;
    let query = Model.findById(id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    let document = await query;
    if (!document) {
      return next(
        new appError(`No ${Model.modelName} found with this ID`, 404)
      );
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });

// read all
export const readAll = (Model, options) =>
  catchAsync(async (req, res, next) => {
    // to allow nested Get reviews on tour rout
    if (req.params.tourId) {
      req.normalizedQuery = Object.assign(req.normalizedQuery, {
        tour: req.params.tourId,
      });
    }

    // Query creation
    let features = await new apiFeatures(Model, req.normalizedQuery)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    let query = features.query;

    // to populate reviews when get tours
    if (options?.populationOptions) {
      query = query.populate(options?.populationOptions);
    }

    // Query Excution
    let documents = await query;
    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        documents,
      },
    });
  });
