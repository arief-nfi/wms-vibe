import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import e, { Router } from "express";
import { db } from "src/server/lib/db";
import { department } from "src/server/lib/db/schema/demo";
import { authenticated, authorized } from "src/server/middleware/authMiddleware";
import { validateData } from "src/server/middleware/validationMiddleware";
import { departmentNameValidationSchema, departmentSchema } from "src/server/schemas/departmentSchema";
import { format } from "date-fns";

const departmentRoutes = Router();
departmentRoutes.use(authenticated());

/**
 * @swagger
 * /api/demo/department:
 *   get:
 *     tags:
 *       - Demo - Department
 *     summary: Get all departments
 *     description: Retrieve a list of all departments
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
 *         description: The number of departments to retrieve per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: name
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
 *         description: A filter to apply to the department names
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The department ID
 *         name:
 *           type: string
 *           description: The name of the department
 *         group:
 *           type: string
 *           description: The group of the department
 *         since:
 *           type: string
 *           format: date
 *           description: The date when the department was created
 *         inTime:
 *           type: string
 *           format: time
 *           description: The time check in
 *         outTime:
 *           type: string
 *           format: time
 *           description: The time check out
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the department
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the department was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the department was last updated
 */
departmentRoutes.get("/", async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageParam = req.query.page as string | undefined;
  const perPageParam = req.query.perPage as string | undefined;
  const sortParam = req.query.sort || 'name';
  const orderParam = req.query.order || 'asc';
  const filterParam = req.query.filter || '';

  // Map allowed sort keys to columns
  const sortColumns = {
    id: department.id,
    name: department.name,
    group: department.group,
    // add other columns as needed
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || department.name;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
  const filterCondition = filterParam
    ? and(
        or(
          ilike(department.name, `%${filterParam}%`), 
          ilike(department.group, `%${filterParam}%`),
        ), 
        eq(department.tenantId, req.user?.activeTenantId)
      )
    : eq(department.tenantId, req.user?.activeTenantId);

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(department)
    .where(filterCondition);

  const departments = await db
    .select()
    .from(department)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  res.json({
    departments,
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
 * /api/demo/department/{id}:
 *   get:
 *     tags:
 *       - Demo - Department
 *     summary: Get a department by ID
 *     description: Retrieve a specific department by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 */
departmentRoutes.get("/:id", async (req, res) => {
  const idParam = req.params.id;

  try {
    const data = await db
      .select()
      .from(department)
      .where(eq(department.id, idParam))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (req.user?.activeTenantId !== data.tenantId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/demo/department/add:
 *   post:
 *     tags:
 *       - Demo - Department
 *     summary: Add a new department
 *     description: Create a new department with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Department created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     DepartmentForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The department ID
 *         name:
 *           type: string
 *           description: The name of the department
 *         group:
 *           type: string
 *           description: The name of the department
 *         since:
 *           type: string
 *           format: date
 *           description: The date when the department was created
 *         inTime:
 *           type: string
 *           format: time
 *           description: Time in HH:mm:ss format (only time part used)
 *         outTime:
 *           type: string
 *           format: time
 *           description: Time in HH:mm:ss format (only time part used)
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the department
 */
departmentRoutes.post("/add", validateData(departmentSchema), async (req, res) => {
  const { name, group, since, inTime, outTime, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const newDepartment = await db.insert(department).values({
      id: crypto.randomUUID(),
      name,
      group,
      since: format(since, 'yyyy-MM-dd'),
      inTime: format(inTime, 'HH:mm:ss'),
      outTime: format(outTime, 'HH:mm:ss'),
      tenantId,
    })
      .returning()
      .then((rows) => rows[0]);

    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/demo/department/{id}/edit:
 *   put:
 *     tags:
 *       - Demo - Department
 *     summary: Update a department
 *     description: Update the details of an existing department
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
departmentRoutes.put("/:id/edit", validateData(departmentSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, name, group, since, inTime, outTime, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ error: "Invalid department ID" });
  }

  try {
    const updatedDepartment = await db.update(department).set({
      name,
      group,
      since: format(since, 'yyyy-MM-dd'),
      inTime: format(inTime, 'HH:mm:ss'),
      outTime: format(outTime, 'HH:mm:ss'),
    }).where(and(
      eq(department.id, id),
      eq(department.tenantId, tenantId)
    )
    )
      .returning()
      .then((rows) => rows[0]);

    res.status(200).json(updatedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/demo/department/{id}/delete:
 *   delete:
 *     tags:
 *       - Demo - Department
 *     summary: Delete a department
 *     description: Delete an existing department by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
departmentRoutes.delete("/:id/delete", async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;
  const tenantId = req.user.activeTenantId;

  try {
    const deletedDepartment = await db.delete(department).where(and(
      eq(department.id, idParam),
      eq(department.tenantId, tenantId)
    )).returning()
      .then((rows) => rows[0]);

    if (!deletedDepartment) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/demo/department/validate-name:
 *   post:
 *     tags:
 *       - Demo - Department
 *     summary: Validate department name
 *     description: Check if the department name is unique within the tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentCodeValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department name is valid
 *       400:
 *         description: Department name must be unique within the tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     DepartmentCodeValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The department ID
 *         name:
 *           type: string
 *           description: The name of the department
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the department
 */
departmentRoutes.post("/validate-name", validateData(departmentNameValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Department name is valid." });
});

export default departmentRoutes;