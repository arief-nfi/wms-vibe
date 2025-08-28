import React from 'react'

import data from "./data.json"
import { SectionCards } from './SectionCards'
import { ChartAreaInteractive } from './ChartAreaInteractive'
import { DataTable } from './DataTable'

const Dashboard = () => {
  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4" >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
      </header>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-2 py-2 md:gap-6">

          <SectionCards />
          <div className="px-0 lg:px-0">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />

        </div>
      </div>
    </>
  )
}

export default Dashboard