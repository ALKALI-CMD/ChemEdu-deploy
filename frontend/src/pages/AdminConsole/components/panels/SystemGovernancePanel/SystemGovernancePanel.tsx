import { Activity, Boxes, ClipboardCheck, GitBranch, KeyRound, ShieldCheck } from 'lucide-react'
import type { EducationDashboardResponse } from '@/objects/dashboard/apiTypes/EducationDashboardResponse'
import { AuditProcessTimeline, EmptyIllustrationState } from '@/components/education/VisualStates'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/UiComponents'
import { educationRoleLabel } from '@/components/education-shell/navigation'
import { zh } from '@/lib/localization'

export default function SystemGovernancePanel({ dashboard }: { dashboard: EducationDashboardResponse }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="权限规则" value={String(dashboard.permissionMatrix.length)} detail="RBAC 操作权限矩阵" />
        <MetricCard title="资源授权" value={String(dashboard.resourcePermissionGrants.length)} detail="课程、资源与班级授权" />
        <MetricCard title="审计链路" value={String(dashboard.auditTrail.length)} detail="课程、内容、角色和组织变更" />
        <MetricCard title="P95 耗时" value={`${dashboard.observability.apiLatencyP95Ms}ms`} detail={`${dashboard.observability.criticalTraceCount} 条关键链路`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <KeyRound className="h-5 w-5 text-slate-600" />
              操作权限矩阵
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {dashboard.permissionMatrix.map((entry) => (
              <div key={`${entry.role}-${entry.permissionKey}-${entry.scope}`} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-950">{entry.permissionKey}</p>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50">
                    {educationRoleLabel[entry.role] ?? entry.role}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{entry.action} / {entry.resourceType} / {entry.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <ShieldCheck className="h-5 w-5 text-slate-600" />
              资源级鉴权
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.resourcePermissionGrants.slice(0, 12).map((grant) => (
              <div key={`${grant.resourceType}-${grant.resourceId}-${grant.principalType}-${grant.principalId}-${grant.permissionKey}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium text-slate-950">{grant.permissionKey}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {grant.principalType}:{grant.principalId} {'->'} {grant.resourceType}:{grant.resourceId}
                </p>
                <p className="mt-1 text-xs text-slate-500">scope: {grant.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AuditProcessTimeline auditTrail={dashboard.auditTrail} />

      <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <GitBranch className="h-5 w-5 text-slate-600" />
            操作日志与审计链
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard.auditTrail.length === 0 ? (
            <EmptyIllustrationState
              kind="audit"
              title="暂无审计链路"
              message="课程审核、内容治理、角色修改和组织变更后会记录在这里。"
            />
          ) : null}
          {dashboard.auditTrail.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-950">{entry.actorName} · {entry.action}</p>
                <Badge variant="secondary">{entry.traceId}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">{entry.targetType}:{entry.targetId} · {zh(entry.detail)}</p>
              <p className="mt-1 text-xs text-slate-500">{zh(entry.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <ClipboardCheck className="h-5 w-5 text-slate-600" />
              测试体系
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.testStrategy.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-950">{item.layer}</p>
                  <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>{item.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.target}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{item.command}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Activity className="h-5 w-5 text-slate-600" />
              监控与可观测性
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>错误日志：{dashboard.observability.errorLogEnabled ? '已开启' : '未开启'}</p>
            <p>性能监控：{dashboard.observability.performanceMonitoringEnabled ? '已开启' : '未开启'}</p>
            <p>最近事件：{dashboard.observability.lastIncidentAt ? zh(dashboard.observability.lastIncidentAt) : '暂无'}</p>
            <div className="flex flex-wrap gap-2">
              {dashboard.observability.metrics.map((metric) => (
                <Badge key={metric} variant="secondary">{metric}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Boxes className="h-5 w-5 text-slate-600" />
              配置与部署
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Docker：{dashboard.deploymentConfig.dockerEnabled ? '已配置' : '未配置'}</p>
            <p>CI/CD：{dashboard.deploymentConfig.ciEnabled ? '已配置' : '未配置'}</p>
            <p>数据库结构：{dashboard.deploymentConfig.schemaMode}</p>
            <p>种子数据：{dashboard.deploymentConfig.seedDataMode}</p>
            <div className="flex flex-wrap gap-2">
              {dashboard.deploymentConfig.environments.map((env) => (
                <Badge key={env} variant="secondary">{env}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  )
}
