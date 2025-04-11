/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useSession } from "next-auth/react";
import React from "react";
import MainLayout from "../../../layouts/MainLayout";
import Navbar from "../../../layouts/Navbar";
import Button from "../../../components/Button";
import { useRouter } from "next/router";
import TextInput from "../../../components/input/TextInput";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BackButton from "../../../components/BackButton";
import clsx from "clsx";
import axios from "../../../utils/axios";
import { usePoolStore } from "../../../utils/store";
import { toast } from "react-toastify";
import { GrantResponse } from "../../../types/grant";
import { Dialog } from "@headlessui/react";
import dayjs from "dayjs";
import GrantCard from "../../../components/grant/GrantCard";
import GrantSearchModal from "../../../components/grant/GrantSearchModal";
import Add from "../../../components/icons/Add";
import DateInput from "../../../components/input/DateInput";
import Card from "../../../layouts/Card";
import { useHasHydrated } from "../../../utils/useHydrated";
import minMax from "dayjs/plugin/minMax";
import TextAreaInput from "../../../components/input/TextAreaInput";
import { User } from "../../../types/user";
dayjs.extend(minMax);

const validationSchema = z
  .object({
    name: z.string().min(1, { message: "Pool name is required" }),
    description: z.string().min(1, { message: "Pool description is required" }),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z
      .date({ required_error: "End date is required" })
      .refine((date) => date > new Date(), {
        message: "End date must be after today",
      }),
  })
  .refine((schema) => schema.endDate > schema.startDate, {
    path: ["endDate"],
    message: "End date must be after start date",
  });

type ValidationSchema = z.infer<typeof validationSchema>;

export default function EditPool() {
  const router = useRouter();
  const { id } = router.query;
  const hasHydrated = useHasHydrated();
  const { status, data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
  const {
    grants,
    addGrantsToPool,
    removeGrantFromPool,
    clearGrantsFromPool,
    resetGrantsInPool,
  } = usePoolStore();
  const [error, setError] = React.useState<{
    message: string;
    statusCode: number;
  }>();

  const startDate = watch("startDate", new Date());

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    if (grants.length > 0) {
      setLoading(true);

      axios
        .patch(`/pools/${id}`, {
          ...data,
          grants: grants.map((grant) => grant.id),
        })
        .then(() => {
          toast.success("Pool edited successfully!");
          router.push(`/pools/${id}`);
          clearGrantsFromPool();
        })
        .catch((err) => {
          console.error(err);
          toast.error(
            err.response?.data?.message || err.message || "Something went wrong"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      toast.error("At least one grant must be selected!", {
        toastId: "pool-edit-error",
      });
    }
  };

  const onSelect = (grant: GrantResponse) => {
    addGrantsToPool(grant);
  };

  const onRemove = (grant: GrantResponse) => {
    removeGrantFromPool(grant);
  };

  const getPool = () => {
    setLoading(true);
    axios
      .get(`/pools/${id}`)
      .then((res) => {
        if (res.data) {
          const { grants, ...data } = res.data;

          // Check if user owns the pool
          if (
            !data.team.some((user: User) => user.email === session?.user?.email)
          ) {
            toast.error("User is not part of this pool!", {
              toastId: "user-unauthorized-error",
            });
            router.push(`/pools/${id}`);
          }

          resetGrantsInPool(grants);
          reset({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
          });
        }
      })
      .catch((err) => {
        console.error({ err });
        toast.error(
          err.response?.data?.message || err.message || "Something went wrong",
          {
            toastId: "retrieve-pool-error",
          }
        );
        setError(err.response?.data);
        if (err.response?.status === 404) {
          clearGrantsFromPool();
        }
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    if (id && session) {
      getPool();
    }
  }, [id, session]);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
    }
  }, [status]);

  return (
    <div>
      <Head>
        <title>マッチングファンドの編集 | DigDAO マッチングドネーション</title>
        <meta
          name="description"
          content="マッチングドネーション（Quadratic Funding）でお気に入りのプロジェクトに寄付して、公共財を支援しよう."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MainLayout>
        <Navbar className="p-0" location="pools" />
        <form
          className="flex flex-col items-start justify-center px-2 md:px-8 my-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <BackButton href="/pools">Back to pools</BackButton>
          <div className="w-full flex flex-col my-10 gap-y-8" id="main-div">
            <h1 className="font-bold text-subtitle-1">Edit Pool</h1>
            <div className="rounded-xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-x-12 md:gap-y-14">
              <Card className="bg-white shadow-card px-4 py-6 min-h-[420px] md:min-h-[520px] cursor-default">
                <div className="grid grid-cols-2 w-full gap-x-4 gap-y-6">
                  <div className="form-control w-full col-span-2">
                    <label className="label">
                      <span className="label-text font-bold text-lg">
                        Pool Name
                      </span>
                    </label>
                    <TextInput
                      type="text"
                      className={clsx("w-full")}
                      errors={errors}
                      id="name"
                      register={register}
                    />
                  </div>
                  <div className="form-control w-full col-span-1">
                    <label className="label">
                      <span className="label-text font-bold text-lg">
                        Start Date
                      </span>
                    </label>
                    {/* <div
                      className="tooltip tooltip-secondary"
                      data-tip="You cannot modify the start date of this matching round (pool)"
                    > */}
                    {hasHydrated && (
                      <Controller
                        control={control}
                        name="startDate"
                        render={({
                          field: { onChange, onBlur, value, name },
                        }) => (
                          <DateInput
                            disabled
                            onBlur={onBlur}
                            minDate={new Date()}
                            value={value}
                            errors={errors}
                            name={name}
                            onChange={onChange}
                          />
                        )}
                      />
                    )}
                    {/* </div> */}
                  </div>
                  <div className="form-control w-full col-span-1">
                    <label className="label">
                      <span className="label-text font-bold text-lg">
                        End Date
                      </span>
                    </label>
                    <Controller
                      control={control}
                      name="endDate"
                      render={({
                        field: { onChange, onBlur, value, name, ref },
                      }) => (
                        <DateInput
                          onBlur={onBlur}
                          minDate={dayjs
                            .max(dayjs(), dayjs(startDate))
                            .add(1, "day")
                            .toDate()}
                          disabled={!!error}
                          value={value}
                          errors={errors}
                          name={name}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="form-control w-full col-span-2">
                    <label className="label">
                      <span className="label-text font-bold text-lg">
                        Pool Description
                      </span>
                    </label>
                    <TextAreaInput
                      rows={3}
                      id="description"
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
                <Button
                  width="full"
                  className="mt-6"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading || !!error}
                >
                  Save changes
                </Button>
              </Card>
              <Card
                className={clsx(
                  "border-sg-secondary border px-4 py-6 flex flex-col items-center justify-center min-h-[420px] md:min-h-[520px]",
                  !!error
                    ? "opacity-50 cursor-default"
                    : "opacity-100 group cursor-pointer"
                )}
                onClick={() => (!!error ? undefined : setIsOpen(true))}
              >
                <Add className="group-hover:scale-110 transition-all duration-200" />
                <p className="text-center mt-2 font-bold text-2xl">Add Grant</p>
              </Card>
              {hasHydrated &&
                grants &&
                grants.map((grant) => (
                  <div
                    className="relative group"
                    key={grant.id}
                    onClick={() => onRemove(grant)}
                  >
                    <GrantCard
                      grant={grant}
                      hideButton
                      className="group-hover:opacity-50"
                    />
                    <button className="bg-sg-error rounded-full px-12 py-4 font-bold absolute left-[50%] top-[50%] transform -translate-x-[50%] -translate-y-[50%] invisible group-hover:visible z-10 transition-none">
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </form>
      </MainLayout>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="min-w-[420px] max-w-7xl rounded bg-white h-max overflow-y-scroll max-h-[80vh]">
            <GrantSearchModal
              onClose={() => setIsOpen(false)}
              onSelect={onSelect}
              grants={grants}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
