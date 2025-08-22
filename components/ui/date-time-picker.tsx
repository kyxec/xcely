"use client"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
    date?: Date
    onDateTimeChange?: (dateTime: Date | undefined) => void
    label?: string
    placeholder?: string
    disabled?: boolean
}

export function DateTimePicker({
    date,
    onDateTimeChange,
    label = "Date & Time",
    placeholder = "Select date and time",
    disabled = false
}: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
    const [time, setTime] = React.useState<string>(
        date ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : "10:30"
    )

    const handleDateSelect = (newDate: Date | undefined) => {
        setSelectedDate(newDate)
        setOpen(false)
        updateDateTime(newDate, time)
    }

    const handleTimeChange = (newTime: string) => {
        setTime(newTime)
        updateDateTime(selectedDate, newTime)
    }

    const updateDateTime = (date: Date | undefined, timeStr: string) => {
        if (!date) {
            onDateTimeChange?.(undefined)
            return
        }

        const [hours, minutes] = timeStr.split(':').map(Number)
        const newDateTime = new Date(date)
        newDateTime.setHours(hours, minutes, 0, 0)
        onDateTimeChange?.(newDateTime)
    }

    const formatDisplayDate = () => {
        if (!selectedDate) return placeholder
        return `${selectedDate.toLocaleDateString()} at ${time}`
    }

    return (
        <div className="space-y-2">
            {label && <Label className="text-sm font-medium">{label}</Label>}
            <div className="flex gap-4">
                <div className="flex flex-col gap-3 flex-1">
                    <Label htmlFor="date-picker" className="px-1 text-xs">
                        Date
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker"
                                className="w-full justify-between font-normal"
                                disabled={disabled}
                            >
                                {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                captionLayout="dropdown"
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                    <Label htmlFor="time-picker" className="px-1 text-xs">
                        Time
                    </Label>
                    <Input
                        type="time"
                        id="time-picker"
                        value={time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        disabled={disabled}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>
        </div>
    )
}

// Keep the original Calendar24 component for backwards compatibility
export function Calendar24() {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1">
                    Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="w-32 justify-between font-normal"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex flex-col gap-3">
                <Label htmlFor="time-picker" className="px-1">
                    Time
                </Label>
                <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    defaultValue="10:30:00"
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </div>
        </div>
    )
}
