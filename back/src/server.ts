import { app } from "./app";
import { environment } from "../infra/config/environment";

app.listen(environment.port, "0.0.0.0", () => {
  console.info(`GameHub API disponível na porta ${environment.port} (0.0.0.0)`);
});
