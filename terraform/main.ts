// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import { AzurermProvider } from "./.gen/providers/azurerm/provider";
import { DataAzurermClientConfig } from "./.gen/providers/azurerm/data-azurerm-client-config";
import { ResourceGroup } from "./.gen/providers/azurerm/resource-group";
import { LogAnalyticsWorkspace } from "./.gen/providers/azurerm/log-analytics-workspace";
import { MssqlServer } from "./.gen/providers/azurerm/mssql-server";
import { MssqlDatabase } from "./.gen/providers/azurerm/mssql-database";
import { KeyVault } from "./.gen/providers/azurerm/key-vault";
import { KeyVaultSecret } from "./.gen/providers/azurerm/key-vault-secret";
import { AppServicePlan } from "./.gen/providers/azurerm/app-service-plan";
import { AppService } from "./.gen/providers/azurerm/app-service";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AzurermProvider(this, "azurerm", { features: {} });
    let productName = "terraformcdk";
    let environment = "dev";
    let region = "eastus";
    let regionCode = "eus";

    // get current context info
    let currentContext = new DataAzurermClientConfig(this, "currentContext", {});
    
    // create resource group
    let rg = new ResourceGroup(this, "rg", {
      name: `rg-${productName}-${environment}-${regionCode}`,
      location: region
    });

    // create log analytics workspace
    // let law = new LogAnalyticsWorkspace(this, "law", {
    new LogAnalyticsWorkspace(this, "law", {
      resourceGroupName: rg.name,
      location: rg.location,

      name: `law-${productName}-${environment}`,
      sku: "PerGB2018"
    });

    // create sql db server
    let sql = new MssqlServer(this, "sql", {
      resourceGroupName: rg.name,
      location: rg.location,

      name: `sql-${productName}-${environment}`,
      version: "12.0",
      administratorLogin: "sqladmin",
      administratorLoginPassword: "securePassword!"
    });

    // create sql db
    let sqldb = new MssqlDatabase(this, "sqldb", {
      serverId: sql.id,

      name: "appdb"
    })

    // create key vault
    let kv = new KeyVault(this, "kv", {
      resourceGroupName: rg.name,
      location: rg.location,

      name: `kv-${productName}-${environment}`,
      skuName: "standard",
      tenantId: currentContext.tenantId,
      accessPolicy: [{
        objectId: currentContext.objectId,
        tenantId: currentContext.tenantId,
        secretPermissions: ["Get","Set","List"]
      }]
    });

    // add key vault secret
    //let kvsDbConnectString = new KeyVaultSecret(this, "kvsDbConnectString", {
    new KeyVaultSecret(this, "kvsDbConnectString", {
      keyVaultId: kv.id,

      name: `kvs-${productName}-dbconnectstring-${environment}`,
      value: `Data Source=tcp:${sql.fullyQualifiedDomainName},1433;Initial Catalog=${sqldb.name};User Id=${sql.administratorLogin};Password=${sql.administratorLoginPassword};`
    });

    // create app service plan
    let asp = new AppServicePlan(this, "asp", {
      resourceGroupName: rg.name,
      location: rg.location,

      name: `asp-${productName}-${environment}`,
      sku: {
        size: "F1",
        tier: "Free"
      }
    });

    // create app service
    let webApp = new AppService(this, "app", {
      resourceGroupName: rg.name,
      location: rg.location,
      appServicePlanId: asp.id,

      name: `app-${productName}-${environment}`
    })

    new TerraformOutput(this, "appUrl", {
      value: `https://${webApp.name}.azurewebsites.net`
    })
  }
}

const app = new App();
new MyStack(app, "terraform");
app.synth();
