import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { FiTrendingUp, FiUsers, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const KPICard = ({ title, value, icon: Icon, trend, className = '' }: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  className?: string;
}) => (
  <Card className={`card-elevated hover:glow-effect transition-smooth ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold gradient-text">{value}</div>
          {trend && (
            <p className="text-xs text-success mt-1 flex items-center">
              <FiTrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Analytics = () => {
  const { analytics, settings, showAnalytics } = useStore();

  if (!showAnalytics || !analytics) {
    return null;
  }

  const { currencySymbol } = settings;

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Amount Collected"
          value={`${currencySymbol}${analytics.totalAmount.toLocaleString()}`}
          icon={FiDollarSign}
          trend="+12.3%"
        />
        <KPICard
          title="Total Tax Calculated"
          value={`${currencySymbol}${analytics.totalTax.toLocaleString()}`}
          icon={FiTrendingUp}
          trend="+8.1%"
        />
        <KPICard
          title="Total Students"
          value={analytics.totalStudents.toLocaleString()}
          icon={FiUsers}
          trend="+5.4%"
        />
        <KPICard
          title="Average Tax"
          value={`${currencySymbol}${Math.round(analytics.avgTax).toLocaleString()}`}
          icon={FiCreditCard}
          trend="+2.8%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fees & Tax */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Fees & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.feesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${currencySymbol}${value.toLocaleString()}`,
                    name === 'fees' ? 'Fees' : 'Tax'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="fees"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[0] }}
                />
                <Line
                  type="monotone"
                  dataKey="tax"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[1] }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fees by Course */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Fees by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.feesByCourse}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="fees"
                  label={({ course, percent }) => `${course} (${(percent * 100).toFixed(1)}%)`}
                >
                  {analytics.feesByCourse.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Fees']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Analysis */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Payment Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.feesByPaymentMode}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="pmode" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? `${currencySymbol}${value.toLocaleString()}` : value,
                    name === 'amount' ? 'Amount' : 'Count'
                  ]}
                />
                <Bar dataKey="amount" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch-wise Fees */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Branch-wise Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.feesByBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="branch" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'fees' ? `${currencySymbol}${value.toLocaleString()}` : value,
                    name === 'fees' ? 'Fees' : 'Students'
                  ]}
                />
                <Bar dataKey="fees" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};