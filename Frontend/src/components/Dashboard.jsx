import React from 'react'
import '../styles/components.css'
import FocusCard from './FocusCard'
import StatsCard from './StatsCard'

export default function Dashboard({ onFocusCardReady }) {
    return (
        <div className="dashboard w-[99%] h-[731px] bg-transparent mt-4 
        flex flex-col items-center justify-start rounded-[12px] ">

            <div className="productivityTrack w-[100%] h-[100%] flex
            flex-row items-center justify-between gap-3">

                <FocusCard onNewTask={onFocusCardReady} />
                <StatsCard />
            </div>

        </div>
    )
}
