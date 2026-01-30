import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const getTodos = query({
    handler: async (ctx) => {
        const todos =await ctx.db.query("todos").order("desc").collect();
        return todos;
    },
});

export const addTodo = mutation({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        const todoID = await ctx.db.insert("todos", { 
            text: args.text, 
            isCompleted: false 
        });
        return todoID;
    },
});

export const toggleTodo = mutation({
    args: { todoID: v.id("todos") },
    handler: async (ctx,args) => {
        const todo = await ctx.db.get(args.todoID);
        if(!todo) throw new ConvexError("Todo not found");

        await ctx.db.patch(args.todoID, {
            isCompleted: !todo.isCompleted
        })
    },
});

export const deleteTodo = mutation({
    args: { todoID: v.id("todos") },
    handler: async (ctx,args) => {
        await ctx.db.delete(args.todoID);
    },
});

export const updateTodo = mutation({
    args: {
        todoID: v.id("todos"),
        text: v.string()
    },
    handler: async (ctx,args) => {
        await ctx.db.patch(args.todoID, {
            text: args.text
        });
    }
});

export const clearAllTodos = mutation({
    handler: async (ctx) => {
        const allTodos = await ctx.db.query("todos").collect();

        for(const todo of allTodos){
            await ctx.db.delete(todo._id);
        }

        return {deletedCount: allTodos.length}
    },
});