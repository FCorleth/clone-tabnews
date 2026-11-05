import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

export async function postHandler(req, res) {
  const userBody = req.body;
  const newUser = await user.create(userBody);

  return res.status(201).json(newUser);
}
