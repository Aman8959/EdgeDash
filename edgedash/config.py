from dataclasses import dataclass
from pathlib import Path
import yaml


@dataclass
class Config:
    """User profile and application settings."""
    target_role: str
    target_city: str
    keywords: list[str]
    my_skills: list[str]
    experience_years: int
    db_path: str
    min_fit_score: int


def load_config(config_path: str = "config.yaml") -> Config:
    """Load configuration from YAML file with sensible defaults.
    
    Args:
        config_path: Path to config.yaml file.
        
    Returns:
        Config dataclass instance.
        
    Raises:
        FileNotFoundError: If config.yaml is not found.
        ValueError: If required fields are missing or malformed.
    """
    path = Path(config_path)
    
    if not path.exists():
        raise FileNotFoundError(
            f"config.yaml not found at {path.resolve()}. "
            "Copy the example config.yaml and edit it with your details."
        )
    
    with open(path, "r") as f:
        data = yaml.safe_load(f) or {}
    
    # Validate and extract fields with sensible defaults
    try:
        config = Config(
            target_role=data.get("target_role", ""),
            target_city=data.get("target_city", ""),
            keywords=data.get("keywords", []),
            my_skills=data.get("my_skills", []),
            experience_years=data.get("experience_years", 0),
            db_path=data.get("db_path", "edgedash.db"),
            min_fit_score=data.get("min_fit_score", 60),
        )
        
        # Fail loudly on missing critical fields
        if not config.target_role:
            raise ValueError("target_role is required but empty or missing")
        if not config.target_city:
            raise ValueError("target_city is required but empty or missing")
        if not config.my_skills:
            raise ValueError("my_skills is required but empty or missing")
        if not isinstance(config.keywords, list):
            raise ValueError("keywords must be a list")
        if not isinstance(config.my_skills, list):
            raise ValueError("my_skills must be a list")
        if not isinstance(config.experience_years, int) or config.experience_years < 0:
            raise ValueError("experience_years must be a non-negative integer")
        
        return config
        
    except (AttributeError, TypeError) as e:
        raise ValueError(f"config.yaml is malformed: {e}")


if __name__ == "__main__":
    # Entry point: python -m edgedash.config
    try:
        cfg = load_config()
        print("\n=== CONFIG LOADED ===")
        print(f"Target Role:      {cfg.target_role}")
        print(f"Target City:      {cfg.target_city}")
        print(f"Keywords:         {', '.join(cfg.keywords)}")
        print(f"My Skills:        {', '.join(cfg.my_skills)}")
        print(f"Experience:       {cfg.experience_years} years")
        print(f"DB Path:          {cfg.db_path}")
        print(f"Min Fit Score:    {cfg.min_fit_score}")
        print("===================\n")
    except (FileNotFoundError, ValueError) as e:
        print(f"\n❌ CONFIG ERROR: {e}\n")
        exit(1)
