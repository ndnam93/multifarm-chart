import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload || !payload.length) return null;

  let value = payload[0].value;
  if (formatter) {
    value = formatter(value);
  }
  const date = moment(label).format('MMM D, YYYY');

  return (
    <div className="bg-gradient-to-r from-[#474F7E] to-[#343B61] text-xs text-white px-[8px] py-[12px] rounded-md">
      <p>Value: {value}</p>
      <p>{date}</p>
    </div>
  );
};

const formatAprValue = (value: number) => {
  return value.toFixed(2) + '%';
};

const formatTvlValue = (value: number) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'k';
  }
  return value.toFixed(2);
};

const formatXAxisDate = (date: string) => {
  return moment(date).format('MMM D');
};

function App() {
  const [tvlData, setTvlData] = useState([]);
  useEffect(() => {
    axios.get('https://api.multifarm.fi/jay_flamingo_random_6ix_vegas/get_assets?pg=1&tvl_min=50000&sort=tvlStaked&sort_order=desc&farms_tvl_staked_gte=10000000')
      .then(response => {
        let data = response.data?.data?.[0]?.selected_farm?.[0]?.tvlStakedHistory || [];
        data = data.reverse()
          .map(({ date, value }: { date: string, value: number }) => ({
            date: date.replace(/\./g, '-'),
            value,
          }));
        setTvlData(data);
      });
  }, []);
  const aprData = useMemo(() => {
    let value = 0;
    return tvlData.map(({ date }) => {
      value += 5;
      return { date, value };
    });
  }, [tvlData]);

  return (
    <div className="grid grid-cols-2 gap-[1.25rem] text-sm">
      <div className="h-[300px]">
        <p className="my-5 text-white text-center font-bold text-base">Asset APR (y)</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={aprData}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC4DFF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#4DBFFF" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#6B6BB2" strokeOpacity="0.4" />
            <XAxis dataKey="date" tick={{ fill: "#B2BDFF" }} tickLine={false} tickFormatter={formatXAxisDate} />
            <YAxis tick={{ fill: "#B2BDFF" }} tickCount={5} tickLine={false} tickFormatter={formatAprValue} />
            <Tooltip content={<CustomTooltip />} formatter={formatAprValue} />
            <Area type="monotone" dataKey="value" stroke="#D750FF" strokeWidth={2} fill="url(#colorUv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-[300px]">
        <p className="my-5 text-white text-center font-bold text-base">Asset TVL</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={tvlData}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC4DFF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#4DBFFF" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#6B6BB2" strokeOpacity="0.4" />
            <XAxis dataKey="date" tick={{ fill: "#B2BDFF" }} tickLine={false} tickFormatter={formatXAxisDate} />
            <YAxis tick={{ fill: "#B2BDFF" }} tickCount={5} tickLine={false} tickFormatter={formatTvlValue} />
            <Tooltip content={<CustomTooltip />} formatter={formatTvlValue} />
            <Area type="monotone" dataKey="value" stroke="#D750FF" strokeWidth={2} fill="url(#colorUv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
