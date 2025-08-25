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
import { FiTrendingUp, FiUsers, FiDollarSign, FiMapPin } from 'react-icons/fi';
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
          title="Total Revenue"
          value={`${currencySymbol}${analytics.totalIncome.toLocaleString()}`}
          icon={FiDollarSign}
          trend="+12.3%"
        />
        <KPICard
          title="Total Tax Collected"
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
          icon={FiMapPin}
          trend="+2.8%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income & Tax */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Income & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.incomeByMonth}>
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
                    name === 'income' ? 'Income' : 'Tax'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="income"
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

        {/* Income by Course */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="gradient-text">Income by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.incomeByCourse}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="income"
                  label={({ course, percent }) => `${course} (${(percent * 100).toFixed(1)}%)`}
                >
                  {analytics.incomeByCourse.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Income']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State-wise Income */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text">State-wise Income & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.incomeByState}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${currencySymbol}${value.toLocaleString()}`,
                    name === 'income' ? 'Income' : 'Tax'
                  ]}
                />
                <Bar dataKey="income" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="tax" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};