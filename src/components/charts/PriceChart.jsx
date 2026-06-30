import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

export function PriceChart({ data, color = "#E127E5" }) {
  return (
    <div className="glass-panel h-[340px] rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(136,34,210,0.18)" vertical={false} />
          <XAxis dataKey="label" stroke="#B8B5D6" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#B8B5D6"
            tickFormatter={(value) => formatCurrency(value)}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "#1A1446",
              border: "1px solid rgba(136,34,210,0.3)",
              borderRadius: "8px"
            }}
            formatter={(value) => [formatCurrency(value), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fill="url(#priceGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
