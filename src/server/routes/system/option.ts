import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import e, { Router } from "express";
import { db } from "src/server/lib/db";
import { option } from "src/server/lib/db/schema/system";
import { authenticated, authorized } from "src/server/middleware/authMiddleware";
import { validateData } from "src/server/middleware/validationMiddleware";
import { optionCodeValidationSchema, optionSchema } from "src/server/schemas/optionSchema";

const optionRoutes = Router();
optionRoutes.use(authenticated());

/**
 * @swagger
 * /api/system/option:
 *   get:
 *     tags:
 *       - System - Option
 *     summary: Get all options
 *     description: Retrieve a list of all options
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of options to retrieve per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: code
 *         description: The field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: The sort order (asc or desc)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: A filter to apply to the option names
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Option'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The option ID
 *         code:
 *           type: string
 *           description: The code of the option
 *         name:
 *           type: string
 *           description: The name of the option
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the option
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the option was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the option was last updated
 */
optionRoutes.get("/", authorized('SYSADMIN', 'system.option.view'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageParam = req.query.page as string | undefined;
  const perPageParam = req.query.perPage as string | undefined;
  const sortParam = req.query.sort || 'code';
  const orderParam = req.query.order || 'asc';
  const filterParam = req.query.filter || '';

  // Map allowed sort keys to columns
  const sortColumns = {
    id: option.id,
    code: option.code,
    name: option.name,
    value: option.value,
    // add other columns as needed
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || option.name;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
  const filterCondition = filterParam
    ? and(
        or(
          ilike(option.code, `%${filterParam}%`), 
          ilike(option.name, `%${filterParam}%`),
          ilike(option.value, `%${filterParam}%`)
        ), 
        eq(option.tenantId, req.user?.activeTenantId)
      )
    : eq(option.tenantId, req.user?.activeTenantId);

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(option)
    .where(filterCondition);

  const options = await db
    .select()
    .from(option)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  res.json({
    options,
    count: total,
    page,
    perPage,
    sort: sortParam,
    order: orderParam,
    filter: filterParam
  });
});

/**
 * @swagger
 * /api/system/option/{id}:
 *   get:
 *     tags:
 *       - System - Option
 *     summary: Get a option by ID
 *     description: Retrieve a specific option by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the option to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The option details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 */
optionRoutes.get("/:id", authorized('SYSADMIN', 'system.option.view'), async (req, res) => {
  const idParam = req.params.id;

  try {
    const data = await db
      .select()
      .from(option)
      .where(eq(option.id, idParam))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return res.status(404).json({ error: "Option not found" });
    }

    if (req.user?.activeTenantId !== data.tenantId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching option:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/option/add:
 *   post:
 *     tags:
 *       - System - Option
 *     summary: Add a new option
 *     description: Create a new option with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OptionForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Option created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     OptionForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The option ID
 *         code:
 *           type: string
 *           description: The code of the option
 *         name:
 *           type: string
 *           description: The name of the option
 *         value:
 *           type: string
 *           description: The value of the option
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the option
 */
optionRoutes.post("/add", authorized('SYSADMIN', 'system.option.add'), validateData(optionSchema), async (req, res) => {
  const { code, name, value, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const newOption = await db.insert(option).values({
      id: crypto.randomUUID(),
      code,
      name,
      value,
      tenantId,
    })
      .returning()
      .then((rows) => rows[0]);

    res.status(201).json(newOption);
  } catch (error) {
    console.error("Error creating option:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/option/{id}/edit:
 *   put:
 *     tags:
 *       - System - Option
 *     summary: Update a option
 *     description: Update the details of an existing option
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the option to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OptionForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Option updated successfully
 *       404:
 *         description: Option not found
 *       500:
 *         description: Internal server error
 */
optionRoutes.put("/:id/edit", authorized('SYSADMIN', 'system.option.edit'), validateData(optionSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, code, name, value, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ error: "Invalid option ID" });
  }

  try {
    const updatedOption = await db.update(option).set({
      code,
      name,
      value
    }).where(and(
      eq(option.id, id),
      eq(option.tenantId, tenantId)
    )
    )
      .returning()
      .then((rows) => rows[0]);

    res.status(200).json(updatedOption);
  } catch (error) {
    console.error("Error updating option:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/option/{id}/delete:
 *   delete:
 *     tags:
 *       - System - Option
 *     summary: Delete a option
 *     description: Delete an existing option by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the option to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Option deleted successfully
 *       404:
 *         description: Option not found
 */
optionRoutes.delete("/:id/delete", authorized('SYSADMIN', 'system.option.delete'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;
  const tenantId = req.user.activeTenantId;

  try {
    const deletedOption = await db.delete(option).where(and(
      eq(option.id, idParam),
      eq(option.tenantId, tenantId)
    )).returning()
      .then((rows) => rows[0]);

    if (!deletedOption) {
      return res.status(404).json({ error: "Option not found" });
    }

    res.status(200).json({ message: "Option deleted successfully" });
  } catch (error) {
    console.error("Error deleting option:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/option/validate-code:
 *   post:
 *     tags:
 *       - System - Option
 *     summary: Validate option code
 *     description: Check if the option code is unique within the tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OptionCodeValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Option code is valid
 *       400:
 *         description: Option code must be unique within the tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     OptionCodeValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The option ID
 *         code:
 *           type: string
 *           description: The code of the option
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the option
 */
optionRoutes.post("/validate-code", authorized('SYSADMIN', 'system.option.add'), validateData(optionCodeValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Option code is valid." });
});

export default optionRoutes;