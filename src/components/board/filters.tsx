"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface FilterState {
  search: string;
  priority: string | null;
  assigneeId: string | null;
  dueDate: "overdue" | "today" | "this-week" | "no-date" | null;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const activeFilterCount = [
    filters.priority,
    filters.assigneeId,
    filters.dueDate,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      priority: null,
      assigneeId: null,
      dueDate: null,
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9 w-64"
        />
      </div>

      {/* Priority Filter */}
      <Select
        value={filters.priority || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            priority: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              High
            </div>
          </SelectItem>
          <SelectItem value="medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Medium
            </div>
          </SelectItem>
          <SelectItem value="low">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Low
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        value={filters.assigneeId || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            assigneeId: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Due Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Due Date
            {filters.dueDate && (
              <Badge variant="secondary" className="ml-1 text-xs">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="space-y-1">
            <Button
              variant={filters.dueDate === "overdue" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-red-500"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dueDate: filters.dueDate === "overdue" ? null : "overdue",
                })
              }
            >
              Overdue
            </Button>
            <Button
              variant={filters.dueDate === "today" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dueDate: filters.dueDate === "today" ? null : "today",
                })
              }
            >
              Due Today
            </Button>
            <Button
              variant={filters.dueDate === "this-week" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dueDate: filters.dueDate === "this-week" ? null : "this-week",
                })
              }
            >
              This Week
            </Button>
            <Button
              variant={filters.dueDate === "no-date" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  dueDate: filters.dueDate === "no-date" ? null : "no-date",
                })
              }
            >
              No Date
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {(filters.search || activeFilterCount > 0) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount + (filters.search ? 1 : 0)}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}
