import database from "infra/database";
import password from "models/password.js";
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
      message: "Email informado já está sendo utilizado.",
      action: "Utilize outro email para esta operação.",
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
      message: "Username informado já está sendo utilizado.",
      action: "Utilize outro username para esta operação.",
    });
  }
}

async function hashPasswordInObject(userBody) {
  const hashedPassword = await password.hash(userBody.password);
  userBody.password = hashedPassword;
}

async function create(userBody) {
  await validateUniqueUsername(userBody.username);
  await validateUniqueEmail(userBody.email);
  await hashPasswordInObject(userBody);

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

async function updateUser(userInput) {
  const result = await database.query({
    text: `
        UPDATE
          users
        SET
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('utc', now())
        WHERE  
          id = $4
        RETURNING
          *
        ;`,
    values: [
      userInput.username,
      userInput.email,
      userInput.password,
      userInput.id,
    ],
  });

  return result.rows[0];
}

async function update(username, userInput) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInput) {
    await validateUniqueUsername(userInput.username);
  }

  if ("email" in userInput) {
    await validateUniqueEmail(userInput.email);
  }

  if ("password" in userInput) {
    await hashPasswordInObject(userInput);
  }

  const userWithNewValues = { ...currentUser, ...userInput };

  return await updateUser(userWithNewValues);
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
