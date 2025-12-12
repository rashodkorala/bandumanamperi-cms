import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import type { AnalyticsSummary } from "@/lib/types/analytics"

import data from "./data.json"

interface DashboardProps {
    artworksCount: number
    analytics: AnalyticsSummary | null
}

const Dashboard = ({ artworksCount, analytics }: DashboardProps) => {
    return (
        <>
            <div className="flex flex-grow flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards
                            artworksCount={artworksCount}
                            analytics={analytics}
                        />
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive analytics={analytics} />
                        </div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard


