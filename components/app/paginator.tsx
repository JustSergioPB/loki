import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "../ui/pagination";
import { useTranslations } from "next-intl";

type Props = {
  page: number;
  pageSize: number;
  count: number;
};

export default function AppPaginator({ page, pageSize, count }: Props) {
  const t = useTranslations("Paginator");
  const lastPage = Math.ceil(count / pageSize);

  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  function onFirstPage() {
    const params = new URLSearchParams(searchParams);
    params.set("page", "0");
    replace(`${pathname}?${params.toString()}`);
  }

  function onNextPage() {
    const params = new URLSearchParams(searchParams);
    params.set("page", (page + 1).toString());
    replace(`${pathname}?${params.toString()}`);
  }

  function onPreviousPage() {
    const params = new URLSearchParams(searchParams);
    params.set("page", (page - 1).toString());
    replace(`${pathname}?${params.toString()}`);
  }

  function onLastPage() {
    const params = new URLSearchParams(searchParams);
    params.set("page", (lastPage - 1).toString());
    replace(`${pathname}?${params.toString()}`);
  }

  function onPageSizeChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", value);
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Pagination className="justify-end p-6">
      <PaginationContent>
        <PaginationItem className="flex items-center gap-2">
          <span className="font-semibold text-sm">{t("rowsPerPage")}</span>
          <Select onValueChange={onPageSizeChange} defaultValue={`${pageSize}`}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </PaginationItem>
        <PaginationItem>
          <span className="mx-12 font-semibold text-sm">
            {page * pageSize + 1} - {page * pageSize + pageSize} {t("of")}{" "}
            {count}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            onClick={onFirstPage}
            disabled={page === 0}
          >
            <ChevronsLeft />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousPage}
            disabled={page === 0}
          >
            <ChevronLeft />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextPage}
            disabled={page === lastPage - 1}
          >
            <ChevronRight />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="icon"
            onClick={onLastPage}
            disabled={page === lastPage - 1}
          >
            <ChevronsRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
