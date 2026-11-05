import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors";

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

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `SELECT
            username
          FROM
            users
          WHERE
            LOWER(username) = LOWER($1)
          ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Username informado já está sendo utilizado",
      action: "Utilize outro username para realizar o cadastro",
    });
  }
}

async function create(userBody) {
  await validateUniqueEmail(userBody.email);
  await validateUniqueUsername(userBody.username);

  const newUser = await runInsertQuery(userBody);
  return newUser;
}

async function runSelectQuery(username) {
  const result = await database.query({
    text: `
        SELECT 
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
    values: [username],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }

  return result.rows[0];
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;
}

const user = {
  create,
  findOneByUsername,
};

export default user;
