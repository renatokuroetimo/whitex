import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Sidebar from "../Sidebar";
import { useAuth } from "@/contexts/AuthContextHybrid";

// Mock do useAuth
vi.mock("@/contexts/AuthContextHybrid", () => ({
  useAuth: vi.fn(),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/dashboard" }),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("Sidebar Component", () => {
  const mockUser = {
    id: "1",
    email: "test@test.com",
    profession: "medico" as const,
    createdAt: new Date().toISOString(),
  };

  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  describe("Profile Section Tests", () => {
    it('should always show "Meu Perfil" text without profession', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      expect(screen.getByText("Meu Perfil")).toBeInTheDocument();
      expect(screen.queryByText("Médico")).not.toBeInTheDocument();
      expect(screen.queryByText("Paciente")).not.toBeInTheDocument();
    });

    it("should always have white background for profile section", () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const profileSection = screen.getByText("Meu Perfil").closest("div");
      expect(profileSection).toHaveClass("bg-white");
    });

    it("should navigate to correct profile path when clicked", () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const profileButton = screen.getByText("▼");
      fireEvent.click(profileButton);

      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });
  });

  describe("Navigation Tests", () => {
    it("should highlight active navigation item with blue background", () => {
      // Mock useLocation to return /dashboard as active
      vi.doMock("react-router-dom", async () => {
        const actual = await vi.importActual("react-router-dom");
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useLocation: () => ({ pathname: "/dashboard" }),
        };
      });

      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const inicioButton = screen.getByText("Início");
      const buttonElement = inicioButton.closest("button");

      expect(buttonElement).toHaveClass("bg-blue-50");
      expect(buttonElement).toHaveClass("text-blue-700");
      expect(buttonElement).toHaveClass("border-blue-200");
    });

    it("should navigate when navigation items are clicked", () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const pacientesButton = screen.getByText("Pacientes");
      fireEvent.click(pacientesButton);

      expect(mockNavigate).toHaveBeenCalledWith("/pacientes");
    });
  });

  describe("User Type Tests", () => {
    it("should show doctor navigation items for medico user", () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      expect(screen.getByText("Início")).toBeInTheDocument();
      expect(screen.getByText("Pacientes")).toBeInTheDocument();
      expect(screen.getByText("Indicadores")).toBeInTheDocument();
    });

    it("should show patient navigation items for paciente user", () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, profession: "paciente" },
        logout: mockLogout,
      });

      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      expect(screen.getByText("Início")).toBeInTheDocument();
      expect(screen.getByText("Dados pessoais")).toBeInTheDocument();
      expect(screen.getByText("Indicadores")).toBeInTheDocument();
    });

    it("should navigate to patient profile for paciente user", () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, profession: "paciente" },
        logout: mockLogout,
      });

      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const profileButton = screen.getByText("▼");
      fireEvent.click(profileButton);

      expect(mockNavigate).toHaveBeenCalledWith("/patient-profile");
    });
  });

  describe("Profile Image Tests", () => {
    it("should show user icon when no profile image", () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const userIcon = document.querySelector(".lucide-user");
      expect(userIcon).toBeInTheDocument();
    });

    it("should load profile image from localStorage", async () => {
      const mockImageData = "data:image/png;base64,test";
      localStorage.setItem(`profile_image_${mockUser.id}`, mockImageData);

      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const profileImage = screen.queryByAltText("Foto de perfil");
        expect(profileImage).toBeInTheDocument();
        expect(profileImage).toHaveAttribute("src", mockImageData);
      });
    });

    it("should handle profile image error", async () => {
      const mockImageData = "data:image/png;base64,test";
      localStorage.setItem(`profile_image_${mockUser.id}`, mockImageData);

      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const profileImage = await screen.findByAltText("Foto de perfil");

      // Simulate image error
      fireEvent.error(profileImage);

      // Should fall back to user icon
      await waitFor(() => {
        const userIcon = document.querySelector(".lucide-user");
        expect(userIcon).toBeInTheDocument();
      });
    });
  });

  describe("Logout Tests", () => {
    it("should call logout function when logout button clicked", async () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>,
      );

      const logoutButton = screen.getByText("Sair");
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Consistency Tests", () => {
    it("should have consistent styling regardless of active tab", () => {
      // Test with different active paths
      const testPaths = [
        "/dashboard",
        "/pacientes",
        "/indicadores",
        "/patient-profile",
      ];

      testPaths.forEach((path) => {
        vi.doMock("react-router-dom", async () => {
          const actual = await vi.importActual("react-router-dom");
          return {
            ...actual,
            useNavigate: () => mockNavigate,
            useLocation: () => ({ pathname: path }),
          };
        });

        const { unmount } = render(
          <TestWrapper>
            <Sidebar />
          </TestWrapper>,
        );

        // Profile section should always be the same
        expect(screen.getByText("Meu Perfil")).toBeInTheDocument();
        expect(screen.queryByText("Médico")).not.toBeInTheDocument();
        expect(screen.queryByText("Paciente")).not.toBeInTheDocument();

        const profileSection = screen.getByText("Meu Perfil").closest("div");
        expect(profileSection).toHaveClass("bg-white");

        unmount();
      });
    });
  });
});
