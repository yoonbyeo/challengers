class Challenger:
    """챌린저스 프로젝트 메인 클래스"""

    def __init__(self, name: str):
        self.name = name

    def __str__(self) -> str:
        return f"Challenger(name={self.name})"
