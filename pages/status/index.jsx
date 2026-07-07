import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const body = await response.json();

  return body;
}

export default function StatusPage() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <>
      <h1>Status</h1>
      <UpdatedAt data={data} isLoading={isLoading} />
      <DatabaseStatus data={data} isLoading={isLoading} />
    </>
  );
}

function UpdatedAt({ data, isLoading }) {
  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus({ data, isLoading }) {
  if (isLoading) {
    return;
  }

  const { version, max_connections, active_connections } =
    data.dependencies.database;

  return (
    <div>
      <h1>Database</h1>
      <div>Versão: {version}</div>
      <div>Conexões máximas: {max_connections}</div>
      <div>Conexões ativas: {active_connections}</div>
    </div>
  );
}
