import React from 'react';
import { LineChart, CalendarDays, Calendar, CalendarRange, PackageSearch, Box, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
    return (
        <div className="container mx-auto max-w-[1400px]">
            <h2 className="text-[28px] font-montserrat font-bold text-[#212529] mb-6">Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Sales Reports */}
                <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] flex flex-col transition-all duration-300">
                    <div className="p-4 border-b border-[#0000001a] flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-[#212529]" />
                        <h5 className="m-0 font-montserrat font-semibold text-lg text-[#212529]">Sales Reports</h5>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <Link to="/reports/daily" className="flex items-center justify-between p-4 border-b border-[#0000000d] hover:bg-[#f8f9fa] transition-colors w-full text-left no-underline">
                            <div className="flex items-start gap-4">
                                <CalendarDays className="h-6 w-6 text-[#d4af37] mt-1" />
                                <div>
                                    <strong className="text-[#212529] block">Daily Sales Report</strong>
                                    <span className="text-sm text-[#6c757d]">View today's sales transactions</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#6c757d]" />
                        </Link>
                        <Link to="/reports/monthly" className="flex items-center justify-between p-4 border-b border-[#0000000d] hover:bg-[#f8f9fa] transition-colors w-full text-left no-underline">
                            <div className="flex items-start gap-4">
                                <Calendar className="h-6 w-6 text-[#198754] mt-1" />
                                <div>
                                    <strong className="text-[#212529] block">Monthly Sales Report</strong>
                                    <span className="text-sm text-[#6c757d]">View monthly sales summary</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#6c757d]" />
                        </Link>
                        <Link to="/reports/custom" className="flex items-center justify-between p-4 hover:bg-[#f8f9fa] transition-colors w-full text-left no-underline">
                            <div className="flex items-start gap-4">
                                <CalendarRange className="h-6 w-6 text-[#0dcaf0] mt-1" />
                                <div>
                                    <strong className="text-[#212529] block">Custom Date Range</strong>
                                    <span className="text-sm text-[#6c757d]">Generate reports for specific dates</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#6c757d]" />
                        </Link>
                    </div>
                </div>

                {/* Inventory Reports */}
                <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0000001a] flex flex-col transition-all duration-300">
                    <div className="p-4 border-b border-[#0000001a] flex items-center gap-2">
                        <PackageSearch className="h-5 w-5 text-[#212529]" />
                        <h5 className="m-0 font-montserrat font-semibold text-lg text-[#212529]">Inventory Reports</h5>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <Link to="/reports/stock" className="flex items-center justify-between p-4 border-b border-[#0000000d] hover:bg-[#f8f9fa] transition-colors w-full text-left no-underline">
                            <div className="flex items-start gap-4">
                                <Box className="h-6 w-6 text-[#d4af37] mt-1" />
                                <div>
                                    <strong className="text-[#212529] block">Stock Report</strong>
                                    <span className="text-sm text-[#6c757d]">View current stock levels</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#6c757d]" />
                        </Link>
                        <Link to="/reports/lowstock" className="flex items-center justify-between p-4 hover:bg-[#f8f9fa] transition-colors w-full text-left no-underline">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-[#ffc107] mt-1" />
                                <div>
                                    <strong className="text-[#212529] block">Low Stock Report</strong>
                                    <span className="text-sm text-[#6c757d]">Items that need restocking</span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#6c757d]" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Reports;
