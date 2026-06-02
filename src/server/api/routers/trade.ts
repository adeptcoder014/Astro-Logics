import { z } from "zod";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { protectedProcedure, createTRPCRouter } from "~/server/api/trpc"; // Adjust imports to match your project structure
import { db } from "~/server/db";

export const tradeRouter = createTRPCRouter({
  // ==========================================
  // FETCH MT5 HISTORICAL DATA PIPELINE
  // ==========================================
  getHistory: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        timeframe: z.string().default("M1"),
        count: z.number().default(12000),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        // Hits the new historical endpoint on your Python FastAPI backend
        const response = await axios.get(
          `http://127.0.0.1:8000/history/${input.symbol}`,
          {
            params: {
              timeframe: input.timeframe,
              count: input.count,
            },
          }
        );

        // Standardize returning the explicit nested data array matching python payload structure
        return {
          success: true,
          data: response.data.data, 
        };

      } catch (error) {
        console.error(`MT5 Bridge History Error for ${input.symbol}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch MT5 history pipeline data",
        });
      }
    }),

  // ==========================================
  // FETCH MT5 LIVE TICK STREAM
  // ==========================================
  getPrice: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/price/${input.symbol}`
        );

        // Standardize returning the data block cleanly matching python updates payload
        return {
          success: true,
          data: response.data.data,
        };

      } catch (error) {
        console.error(`MT5 Bridge Tick Error for ${input.symbol}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch MT5 price",
        });
      }
    }),
});