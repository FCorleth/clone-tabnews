import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const { username } = req.query;

  const userFound = await user.findOneByUsername(username);

  return res.status(200).json(userFound);
}

async function patchHandler(req, res) {
  const { username } = req.query;
  const userBody = req.body;

  const updatedUser = await user.update(username, userBody);

  return res.status(200).json(updatedUser);
}
