import database from "infra/database";
import { ValidationError } from "infra/errors";

async function runInsertQuery(userBody) {
  const result = await database.query({
    text: `
        INSERT INTO 
            users (username, email, password) 
        VALUES 
            ($1, $2, $3)
        RETURNING 
            *
        ;`,
    values: [userBody.username, userBody.email, userBody.password],
  });

  return result.rows[0];
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
        SELECT 
          emaiL
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Email informado já está sendo utilizado",
      action: "Utilize outro email para realizar o cadastro",
    });
  }
}

async function create(userBody) {
  await validateUniqueEmail(userBody.email);

  const newUser = await runInsertQuery(userBody);
  return newUser;
}

const user = {
  create,
};

export default user;
