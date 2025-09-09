import AuthLayout from "@client/pages/auth/AuthLayout";
import Login from "@client/pages/auth/Login";
import Register from "@client/pages/auth/Register";
import ConsoleLayout from "@client/pages/console/ConsoleLayout";
import Dashboard from "@client/pages/console/dashboard/Dashboard";
import Permission from "@client/pages/console/system/permissions/Permission";
import Role from "@client/pages/console/system/roles/Role";
import ErrorPage from "@client/pages/ErrorPage";
import Home from "@client/pages/Home";
import RootLayout from "@client/pages/RootLayout";
import { createBrowserRouter, redirect } from "react-router";
import ErrorTest from "./pages/console/ErrorTest";
import PermissionAdd from "./pages/console/system/permissions/PermissionAdd";
import PermissionEdit from "./pages/console/system/permissions/PermissionEdit";
import PermissionView from "./pages/console/system/permissions/PermissionView";
import RoleAdd from "./pages/console/system/roles/RoleAdd";
import RoleEdit from "./pages/console/system/roles/RoleEdit";
import Tenant from "./pages/console/system/tenant/Tenant";
import TenantAdd from "./pages/console/system/tenant/TenantAdd";
import TenantView from "./pages/console/system/tenant/TenantView";
import TenantEdit from "./pages/console/system/tenant/TenantEdit";
import Option from "./pages/console/system/option/Option";
import OptionAdd from "./pages/console/system/option/OptionAdd";
import OptionView from "./pages/console/system/option/OptionView";
import OptionEdit from "./pages/console/system/option/OptionEdit";
import RoleView from "./pages/console/system/roles/RoleView";
import User from "./pages/console/system/users/User";
import UserAdd from "./pages/console/system/users/UserAdd";
import UserView from "./pages/console/system/users/UserView";
import UserEdit from "./pages/console/system/users/UserEdit";
import UserResetPassword from "./pages/console/system/users/UserResetPassword";
import Department from "./pages/console/demo/department/Department";
import DepartmentAdd from "./pages/console/demo/department/DepartmentAdd";
import DepartmentView from "./pages/console/demo/department/DepartmentView";
import DepartmentEdit from "./pages/console/demo/department/DepartmentEdit";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import RoleImport from "./pages/console/system/roles/RoleImport";
import CardShowcase from "./pages/console/showcase/CardShowcase";
import TabShowcase from "./pages/console/showcase/TabShowcase";
import FormShowcase from "./pages/console/showcase/FormShowcase";
import RegisterTenant from "./pages/auth/RegisterTenant";
import Partner from "./pages/console/master/partner/Partner";
import PartnerAdd from "./pages/console/master/partner/PartnerAdd";
import PartnerView from "./pages/console/master/partner/PartnerView";
import PartnerEdit from "./pages/console/master/partner/PartnerEdit";
import IntegrationInbound from "./pages/console/master/integration-inbound/IntegrationInboundList";
import IntegrationInboundAdd from "./pages/console/master/integration-inbound/IntegrationInboundAdd";
import IntegrationInboundDetail from "./pages/console/master/integration-inbound/IntegrationInboundDetail";
import IntegrationInboundEdit from "./pages/console/master/integration-inbound/IntegrationInboundEdit";
import WebhookEventList from "./pages/console/master/webhook-events/WebhookEventList";
import WebhookEventAdd from "./pages/console/master/webhook-events/WebhookEventAdd";
import WebhookEventDetail from "./pages/console/master/webhook-events/WebhookEventDetail";
import WebhookEventEdit from "./pages/console/master/webhook-events/WebhookEventEdit";

// Integration Outbound (Webhook) imports
import WebhookList from "./pages/console/master/integration-outbound/WebhookList";
import WebhookAdd from "./pages/console/master/integration-outbound/WebhookAdd";
import WebhookDetail from "./pages/console/master/integration-outbound/WebhookDetail";
import WebhookEdit from "./pages/console/master/integration-outbound/WebhookEdit";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, Component: Home ,
        loader: async () => {
          return redirect("/console/dashboard");
        },
      },
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
          { path: "register-tenant", Component: RegisterTenant },
          { path: "forget-password", Component: ForgetPassword },
          { path: "reset-password", Component: ResetPassword },
        ],
      },
      {
        path: "console",
        Component: ConsoleLayout,
        children: [
          { path: "error-test", Component: ErrorTest },
          { path: "dashboard", Component: Dashboard },
          { 
            path: "showcase", 
            children: [
               { path: "card", Component: CardShowcase },
               { path: "tabs", Component: TabShowcase },
               { path: "form", Component: FormShowcase },
            ]
          },
          { 
            path: "demo", 
            // Component: ConsoleLayout,
            children: [
              { 
                path: "department", 
                children: [
                  { index: true, Component: Department },
                  { path: "add", Component: DepartmentAdd },
                  { path: ":id", Component: DepartmentView },
                  { path: ":id/edit", Component: DepartmentEdit },
                  { path: ":id/delete"}
                ]
              },
            ]
          },
          { 
            path: "int", 
            children: [
              { 
                path: "integration-inbound", 
                children: [
                  { index: true, Component: IntegrationInbound },
                  { path: "add", Component: IntegrationInboundAdd },
                  { path: ":id", Component: IntegrationInboundDetail },
                  { path: ":id/edit", Component: IntegrationInboundEdit },
                  { path: ":id/delete"}
                ]
              },
              { 
                path: "integration-outbound", 
                children: [
                  { 
                    path: "webhook", 
                    children: [
                      { index: true, Component: WebhookList },
                      { path: "add", Component: WebhookAdd },
                      { path: ":id", Component: WebhookDetail },
                      { path: "edit/:id", Component: WebhookEdit },
                      { path: ":id/delete"}
                    ]
                  }
                ]
              },
            ]
          },
          { 
            path: "master", 
            children: [
              { 
                path: "partner", 
                children: [
                  { index: true, Component: Partner },
                  { path: "add", Component: PartnerAdd },
                  { path: ":id", Component: PartnerView },
                  { path: ":id/edit", Component: PartnerEdit },
                  { path: ":id/delete"}
                ]
              },
              { 
                path: "webhook-events", 
                children: [
                  { index: true, Component: WebhookEventList },
                  { path: "add", Component: WebhookEventAdd },
                  { path: ":id", Component: WebhookEventDetail },
                  { path: ":id/edit", Component: WebhookEventEdit },
                  { path: ":id/delete"}
                ]
              },
            ]
          },
          { 
            path: "system", 
            // Component: ConsoleLayout,
            children: [
              { 
                path: "tenant", 
                children: [
                  { index: true, Component: Tenant },
                  { path: "add", Component: TenantAdd },
                  { path: ":id", Component: TenantView},
                  { path: ":id/edit", Component: TenantEdit},
                  { path: ":id/delete"}
                ]
              },
              { 
                path: "permission", 
                children: [
                  { index: true, Component: Permission },
                  { path: "add", Component: PermissionAdd },
                  { path: ":id", Component: PermissionView},
                  { path: ":id/edit", Component: PermissionEdit},
                  { path: ":id/delete"}
                ]
              },
              { path: "role", children: [
                  { index: true, Component: Role},
                  { path: "add", Component: RoleAdd },
                  { path: "import", Component: RoleImport},
                  { path: ":id", Component: RoleView},
                  { path: ":id/edit", Component: RoleEdit}
                ]
              },
              { path: "option", children: [
                  { index: true, Component: Option},
                  { path: "add", Component: OptionAdd},
                  { path: ":id", Component: OptionView},
                  { path: ":id/edit", Component: OptionEdit}
                ]
              },
              { path: "user", children: [
                  { index: true, Component: User },
                  { path: "add", Component: UserAdd },
                  { path: ":id", Component: UserView },
                  { path: ":id/edit", Component: UserEdit },
                  { path: ":id/reset-password", Component: UserResetPassword }
                ]
              },
            ]
          }
        ],
      },
    ],
  },
]);