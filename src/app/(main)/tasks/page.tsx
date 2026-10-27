import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader, inputClass, SubmitButton } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { createTask, updateTaskStatus } from "./actions";

export default async function TasksPage() {
  const [tasks, agents] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      include: { assignee: true, lead: true, contact: true, deal: true },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const now = new Date();

  return (
    <div>
      <PageHeader title="Tasks & Follow-ups" />

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Quick Add Task</h2>
        <form action={createTask} className="grid grid-cols-4 gap-3">
          <input name="title" placeholder="Task title" required className={inputClass + " col-span-2"} />
          <input name="dueDate" type="date" className={inputClass} />
          <select name="priority" className={inputClass} defaultValue="MEDIUM">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select name="assigneeId" className={inputClass + " col-span-2"} defaultValue="">
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          <div className="col-span-2 flex items-end">
            <SubmitButton>Add Task</SubmitButton>
          </div>
        </form>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState message="No tasks yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Related To</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => {
                const overdue = task.dueDate && task.dueDate < now && task.status === "PENDING";
                return (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {task.lead?.fullName ?? task.contact?.fullName ?? task.deal?.title ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{task.assignee?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={overdue ? "font-medium text-red-600" : "text-slate-600"}>
                        {task.dueDate?.toLocaleDateString() ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={task.priority === "URGENT" || task.priority === "HIGH" ? "red" : "slate"}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <form action={async (formData) => { "use server"; await updateTaskStatus(task.id, formData.get("status") as never); }}>
                        <AutoSubmitSelect
                          name="status"
                          defaultValue={task.status}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="SNOOZED">Snoozed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </AutoSubmitSelect>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
