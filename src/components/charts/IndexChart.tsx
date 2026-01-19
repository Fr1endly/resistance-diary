export interface DataItem {
  value: number
  label: string
}

export interface ChartProps {
  data: Array<DataItem>
  orientation: 'horizontal' | 'vertical'
  title: string
}

export default ({ data, orientation, title }: ChartProps) => {
  const maxHeight = Math.max(...data.map((item) => item.value), 100)
  const width = 100 / data.length

  if (orientation === 'vertical') {
    return (
      <>
        <div className="flex-1 h-full w-full flex flex-col-reverse justify-start items-end gap-1">
          {data.map(({ label, value }, index) => (
            <div
              key={index}
              className="flex flex-col justify-end items-end gap-0.5 relative"
              style={{
                width: `calc(${(value / maxHeight) * 100}% + 45px)`,
                height: `${width}%`,
                maxHeight: '40px',
              }}
            >
              <div className="bg-yellow-500 flex justify-between items-center w-full h-full text-nowrap  py-1">
                <span className="text-sm font-bold text-neutral-900 w-full text-right pr-0.5">
                  {value} kg
                </span>
              </div>
              <div className="text-nowrap absolute -left-18.25 inset-y-1">
                <span className="text-xs text-neutral-200 pr-2">{label}</span>
              </div>
            </div>
          ))}
        </div>
        {title && (
          <div className="text-sm text-neutral-200 text-right px-6 py-2 font-display">
            {title}
          </div>
        )}
      </>
    )
  } else {
    return (
      <>
        <div className="flex-1 h-full w-full flex justify-center items-end gap-0.5">
          {data.map(({ label, value }, index) => (
            <div
              key={index}
              className="bg-linear-to-t from-red-500/60 to-red-600/40 h-1/12 flex flex-col justify-between items-center px-0.5"
              style={{
                height: `${(value / maxHeight) * 100}%`,
                width: `${width}%`,
              }}
            >
              <div className="flex flex-col justify-center items-center">
                <span className="text-xs text-neutral-200">{value}</span>
                <span className="text-xs text-neutral-400">kg</span>
              </div>

              <span className="text-xs text-neutral-300">{label}</span>
            </div>
          ))}
        </div>
        {title && (
          <div className="text-sm text-neutral-200 text-right px-6 py-2 font-display">
            {title}
          </div>
        )}
      </>
    )
  }
}
